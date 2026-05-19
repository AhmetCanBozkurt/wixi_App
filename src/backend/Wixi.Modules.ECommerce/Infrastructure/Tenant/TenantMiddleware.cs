using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Infrastructure.Tenant;

/// <summary>
/// Her HTTP isteğinde X-Tenant-Slug header'ından (veya subdomain'den) tenant'ı çözer.
/// Master DB'den WixiTenant kaydını bulur ve TenantContext'i doldurur.
/// </summary>
public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    // Header adı sabit olarak tanımlandı
    private const string TenantSlugHeader = "X-Tenant-Slug";

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        TenantContext tenantContext,
        WixiCoreDbContext masterDbContext)
    {
        // Sadece tenant gerektiren yolları işle, diğerlerini geç
        var path = context.Request.Path.Value ?? string.Empty;
        if (!RequiresTenant(path))
        {
            await _next(context);
            return;
        }

        // Header'dan slug'ı al
        var slug = context.Request.Headers[TenantSlugHeader].FirstOrDefault();

        // Subdomain desteği: {slug}.wixi.com formatı
        if (string.IsNullOrWhiteSpace(slug))
        {
            slug = ExtractSlugFromSubdomain(context.Request.Host.Host);
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            // Tenant bilgisi yok — sadece public endpoint'ler geçebilir
            await _next(context);
            return;
        }

        // Master DB'den tenant'ı bul
        var tenant = await masterDbContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug && t.IsActive && !t.IsDeleted);

        if (tenant is null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { error = "Mağaza bulunamadı." });
            return;
        }

        // TenantContext'i doldur
        tenantContext.Set(tenant.Id, tenant.ConnectionString, tenant.Slug);

        await _next(context);
    }

    // Sadece bu prefix'ler tenant context gerektirir; geri kalan her şey geçer.
    private static bool RequiresTenant(string path)
    {
        if (path.StartsWith("/api/v1/store-admin/auth", StringComparison.OrdinalIgnoreCase))
            return false;

        return path.StartsWith("/api/v1/public/storefront", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/v1/store-admin", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("/api/v1/storefront", StringComparison.OrdinalIgnoreCase);
    }

    private static string? ExtractSlugFromSubdomain(string host)
    {
        // abc-moda.wixi.com → "abc-moda"
        var parts = host.Split('.');
        return parts.Length >= 3 ? parts[0] : null;
    }
}
