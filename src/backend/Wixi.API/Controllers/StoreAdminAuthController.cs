using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/store-admin/auth")]
public class StoreAdminAuthController : ControllerBase
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly WixiCoreDbContext _db;
    private readonly JwtOptions _jwt;

    public StoreAdminAuthController(
        UserManager<WixiUser> userManager,
        WixiCoreDbContext db,
        IOptions<JwtOptions> jwt)
    {
        _userManager = userManager;
        _db = db;
        _jwt = jwt.Value;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] StoreAdminLoginRequest req, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, req.Password))
            return Unauthorized(new { error = "E-posta veya şifre hatalı." });

        // Tenant sahipliğini kontrol et — OwnerUserId veya OwnerEmail ile eşleş
        var tenant = await _db.Tenants
            .Where(t => (t.OwnerUserId == user.Id || t.OwnerEmail == user.Email) && t.IsActive && !t.IsDeleted)
            .FirstOrDefaultAsync(ct);

        if (tenant is null)
            return NotFound(new { error = "Bu hesaba bağlı aktif bir mağaza bulunamadı." });

        // OwnerUserId henüz set edilmediyse şimdi bağla
        if (tenant.OwnerUserId != user.Id)
        {
            tenant.OwnerUserId = user.Id;
            await _db.SaveChangesAsync(ct);
        }

        // TenantAdmin rolü yoksa lazy olarak ata
        var roles = await _userManager.GetRolesAsync(user);
        if (!roles.Contains("TenantAdmin"))
            await _userManager.AddToRoleAsync(user, "TenantAdmin");

        var token = GenerateToken(user, tenant.Slug, tenant.Name);
        return Ok(new
        {
            token,
            tenantSlug = tenant.Slug,
            tenantName = tenant.Name,
            email = user.Email
        });
    }

    private string GenerateToken(WixiUser user, string tenantSlug, string tenantName)
    {
        var key = Encoding.ASCII.GetBytes(_jwt.SecretKey);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new(ClaimTypes.Role, "TenantAdmin"),
            new("tenant_slug", tenantSlug),
            new("tenant_name", tenantName)
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes),
            Issuer = _jwt.Issuer,
            Audience = _jwt.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var handler = new JwtSecurityTokenHandler();
        return handler.WriteToken(handler.CreateToken(descriptor));
    }
}

public record StoreAdminLoginRequest(string Email, string Password);
