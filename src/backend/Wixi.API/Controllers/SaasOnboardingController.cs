using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/saas/onboarding")]
public class SaasOnboardingController : ControllerBase
{
    private readonly WixiCoreDbContext _coreDb;
    private readonly IEnumerable<ITenantProvisioner> _provisioners;
    private readonly IConfiguration _configuration;
    private readonly UserManager<WixiUser> _userManager;
    private readonly IMailService _mailService;

    public SaasOnboardingController(
        WixiCoreDbContext coreDb,
        IEnumerable<ITenantProvisioner> provisioners,
        IConfiguration configuration,
        UserManager<WixiUser> userManager,
        IMailService mailService)
    {
        _coreDb = coreDb;
        _provisioners = provisioners;
        _configuration = configuration;
        _userManager = userManager;
        _mailService = mailService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantRequest request)
    {
        if (await _coreDb.Tenants.AnyAsync(t => t.Slug == request.Slug))
            return BadRequest(new { error = "Bu mağaza adı (URL) zaten alınmış." });

        if (await _userManager.FindByEmailAsync(request.OwnerEmail) != null)
            return BadRequest(new { error = "Bu e-posta adresi zaten kayıtlı." });

        // 1. Tenant kaydı
        var tenant = new WixiTenant
        {
            Name = request.StoreName,
            Slug = request.Slug,
            OwnerEmail = request.OwnerEmail,
            DatabaseName = $"wixi_store_{request.Slug.Replace("-", "_")}",
            EnabledModules = string.Join(",", request.SelectedModules ?? ["ecommerce"]),
            Plan = "Trial"
        };

        _coreDb.Tenants.Add(tenant);
        await _coreDb.SaveChangesAsync();

        // 2. Veritabanı provisioning
        string? provisionError = null;
        try
        {
            var masterConn = _configuration.GetConnectionString("DefaultConnection");
            var connBuilder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(masterConn!)
            {
                InitialCatalog = tenant.DatabaseName
            };
            tenant.ConnectionString = connBuilder.ConnectionString;

            var selectedModules = request.SelectedModules ?? ["ecommerce"];
            foreach (var provisioner in _provisioners)
            {
                if (selectedModules.Contains(provisioner.ModuleName))
                    await provisioner.ProvisionAsync(tenant.Id.ToString(), tenant.ConnectionString, tenant.DatabaseName);
            }

            tenant.IsMigrated = true;
        }
        catch (Exception ex)
        {
            provisionError = ex.Message;
            tenant.LastMigrationError = ex.Message;
        }

        // 3. Tenant admin kullanıcısı oluştur
        var tempPassword = GenerateTempPassword();
        var ownerUser = new WixiUser
        {
            UserName = request.OwnerEmail,
            Email = request.OwnerEmail,
            FirstName = request.StoreName,
            LastName = "Admin",
            EmailConfirmed = true
        };

        var createResult = await _userManager.CreateAsync(ownerUser, tempPassword);
        if (createResult.Succeeded)
        {
            await _userManager.AddToRoleAsync(ownerUser, "TenantAdmin");
            tenant.OwnerUserId = ownerUser.Id;
        }

        // 4. Trial abonelik oluştur
        var freePlan = await _coreDb.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == "free" && p.IsActive && !p.IsDeleted);

        if (freePlan is not null)
        {
            var now = DateTime.UtcNow;
            _coreDb.TenantSubscriptions.Add(new WixiTenantSubscription
            {
                TenantId = tenant.Id,
                PlanId = freePlan.Id,
                Status = "Trial",
                CurrentPeriodStart = now,
                CurrentPeriodEnd = now.AddDays(14)
            });
        }

        await _coreDb.SaveChangesAsync();

        // 5. Şifre kurulum emaili gönder
        if (createResult.Succeeded)
        {
            try
            {
                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(ownerUser);
                var frontendUrl = _configuration["AppUrls:FrontendBaseUrl"] ?? "http://localhost:5183";
                var resetLink = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(request.OwnerEmail)}";

                await _mailService.SendWithTemplateAsync(
                    "TENANT_WELCOME",
                    request.OwnerEmail,
                    new { storeName = request.StoreName, resetLink, tenantSlug = tenant.Slug },
                    CancellationToken.None);
            }
            catch { /* Email hatası kayıt akışını durdurmasın */ }
        }

        if (provisionError is not null)
            return StatusCode(500, new { error = "Veritabanı kurulumu sırasında hata oluştu.", detail = provisionError });

        return Ok(new
        {
            message = "Mağazanız başarıyla kuruldu!",
            slug = tenant.Slug,
            tenantId = tenant.Id,
            adminUrl = $"/admin?tenant={tenant.Slug}",
            requiresPayment = false
        });
    }

    private static string GenerateTempPassword()
    {
        var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
        var random = new Random();
        return new string(Enumerable.Range(0, 16).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}

public record RegisterTenantRequest(
    string StoreName,
    string Slug,
    string OwnerEmail,
    List<string>? SelectedModules
);
