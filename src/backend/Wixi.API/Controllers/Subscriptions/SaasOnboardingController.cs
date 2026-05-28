using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Shared.Configuration;

namespace Wixi.API.Controllers.Subscriptions;

[ApiController]
[Route("api/v1/saas/onboarding")]
public class SaasOnboardingController : ControllerBase
{
    private readonly WixiCoreDbContext _coreDb;
    private readonly IEnumerable<ITenantProvisioner> _provisioners;
    private readonly IConfiguration _configuration;
    private readonly UserManager<WixiUser> _userManager;
    private readonly IMailService _mailService;
    private readonly JwtOptions _jwtOptions;

    public SaasOnboardingController(
        WixiCoreDbContext coreDb,
        IEnumerable<ITenantProvisioner> provisioners,
        IConfiguration configuration,
        UserManager<WixiUser> userManager,
        IMailService mailService,
        IOptions<JwtOptions> jwtOptions)
    {
        _coreDb = coreDb;
        _provisioners = provisioners;
        _configuration = configuration;
        _userManager = userManager;
        _mailService = mailService;
        _jwtOptions = jwtOptions.Value;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantRequest request)
    {
        // Önce tüm validasyonlar — hiçbir DB yazısı yok
        if (await _coreDb.Tenants.AnyAsync(t => t.Slug == request.Slug))
            return BadRequest(new { error = "Bu mağaza adı (URL) zaten alınmış." });

        if (await _userManager.FindByEmailAsync(request.OwnerEmail) != null)
            return BadRequest(new { error = "Bu e-posta adresi zaten kayıtlı." });

        var selectedPlan = await _coreDb.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == request.PlanCode && p.IsActive && !p.IsDeleted);

        var freePlan = await _coreDb.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == "free" && p.IsActive && !p.IsDeleted);

        var finalPlan = selectedPlan ?? freePlan;

        var yearStr = DateTime.UtcNow.Year.ToString();
        var count = await _coreDb.Tenants.CountAsync(t => t.TenantCode.StartsWith(yearStr)) + 1;
        var tenantCode = $"{yearStr}{count:D3}";
        var safeStoreName = System.Text.RegularExpressions.Regex.Replace(request.StoreName, "[^a-zA-Z0-9]", "");

        var masterConn = _configuration.GetConnectionString("DefaultConnection");
        var connBuilder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(masterConn!)
        {
            InitialCatalog = $"wixi_t_{tenantCode}_{safeStoreName}"
        };

        WixiUser ownerUser;
        WixiTenant tenant;
        bool requiresPayment = false;

        // 1–3. Tenant + User + Subscription tek transaction içinde
        await using var tx = await _coreDb.Database.BeginTransactionAsync();
        try
        {
            tenant = new WixiTenant
            {
                TenantCode = tenantCode,
                Name = request.StoreName,
                Slug = request.Slug,
                OwnerEmail = request.OwnerEmail,
                DatabaseName = $"wixi_t_{tenantCode}_{safeStoreName}",
                ConnectionString = connBuilder.ConnectionString,
                EnabledModules = string.Join(",", request.SelectedModules ?? ["ecommerce"]),
                Plan = request.PlanCode ?? "Trial"
            };
            _coreDb.Tenants.Add(tenant);

            ownerUser = new WixiUser
            {
                UserName = request.OwnerEmail,
                Email = request.OwnerEmail,
                FirstName = request.StoreName,
                LastName = "Admin",
                EmailConfirmed = true
            };

            // UserManager aynı WixiCoreDbContext'i kullandığından ambient transaction'a katılır
            var createResult = await _userManager.CreateAsync(ownerUser, request.Password);
            if (!createResult.Succeeded)
            {
                await tx.RollbackAsync();
                var identityError = createResult.Errors.FirstOrDefault()?.Description ?? "Kullanıcı oluşturulurken bir hata oluştu.";
                return BadRequest(new { error = identityError });
            }

            await _userManager.AddToRoleAsync(ownerUser, "TenantAdmin");
            tenant.OwnerUserId = ownerUser.Id;

            if (finalPlan is not null)
            {
                requiresPayment = finalPlan.PriceMonthly > 0;
                var now = DateTime.UtcNow;
                _coreDb.TenantSubscriptions.Add(new WixiTenantSubscription
                {
                    TenantId = tenant.Id,
                    PlanId = finalPlan.Id,
                    Status = requiresPayment ? "PendingPayment" : "Trial",
                    CurrentPeriodStart = now,
                    CurrentPeriodEnd = now.AddDays(14)
                });
            }

            await _coreDb.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, new { error = "Kayıt sırasında bir hata oluştu.", detail = ex.Message });
        }

        // 4. DB Provisioning — DDL olduğundan transaction dışında yapılır.
        //    Başarısız olursa tenant/user kayıtları korunur, admin retry edebilir.
        string? provisionError = null;
        try
        {
            var selectedModules = request.SelectedModules ?? ["ecommerce"];
            foreach (var provisioner in _provisioners)
            {
                if (selectedModules.Contains(provisioner.ModuleName))
                    await provisioner.ProvisionAsync(tenant.Id.ToString(), tenant.ConnectionString!, tenant.DatabaseName);
            }

            tenant.IsMigrated = true;
        }
        catch (Exception ex)
        {
            provisionError = ex.Message;
            tenant.LastMigrationError = ex.Message;
        }

        await _coreDb.SaveChangesAsync();

        // 5. Welcome Email
        try
        {
            var frontendUrl = _configuration["AppUrls:FrontendBaseUrl"] ?? "http://localhost:5183";
            var dashboardUrl = $"{frontendUrl}/tenant/{tenant.Slug}";

            await _mailService.SendWithTemplateAsync(
                "TENANT_WELCOME",
                request.OwnerEmail,
                new { storeName = request.StoreName, resetLink = dashboardUrl, tenantSlug = tenant.Slug },
                CancellationToken.None);
        }
        catch { /* E-posta gönderme hatası kaydı kesmesin */ }

        if (provisionError is not null)
            return StatusCode(207, new { error = "Hesabınız oluşturuldu ancak mağaza veritabanı kurulamadı. Lütfen destek ile iletişime geçin.", detail = provisionError, slug = tenant.Slug, tenantId = tenant.Id });

        // 6. Giriş Token'ı Üret
        var token = GenerateJwtToken(ownerUser, tenant);

        return Ok(new
        {
            message = "Mağazanız başarıyla kuruldu!",
            slug = tenant.Slug,
            tenantId = tenant.Id,
            token = token,
            adminUrl = $"/tenant/{tenant.Slug}",
            requiresPayment = requiresPayment
        });
    }

    [HttpPost("send-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request, CancellationToken ct)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
            return BadRequest(new { error = "Bu e-posta adresi zaten kayıtlı." });

        var code = System.Security.Cryptography.RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        
        try
        {
            await _mailService.SendWithTemplateAsync(
                "TWO_FACTOR_AUTH", // reuse this template for signup code
                request.Email,
                new { fullName = "Wixi Üyesi", code },
                ct);
        }
        catch
        {
            // Fallback: mail sunucusu ayarlı değilse bile kaydı engellememek için loglayıp devam edelim
        }

        return Ok(new { message = "Doğrulama kodu gönderildi.", devCode = code });
    }

    private string GenerateJwtToken(WixiUser user, WixiTenant tenant)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtOptions.SecretKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Role, "TenantAdmin"),
            new Claim("tenant_id", tenant.Id.ToString()),
            new Claim("tenant_slug", tenant.Slug)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public record RegisterTenantRequest(
    string StoreName,
    string Slug,
    string OwnerEmail,
    string Password,
    string? PlanCode,
    List<string>? SelectedModules
);

public record SendOtpRequest(string Email);
