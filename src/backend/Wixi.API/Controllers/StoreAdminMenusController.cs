using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/store-admin/menus")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminMenusController : ControllerBase
{
    private readonly WixiCoreDbContext _db;

    public StoreAdminMenusController(WixiCoreDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// TenantAdmin'in etkinleştirilmiş modüllere ait sidebar menülerini döner.
    /// Path'lardaki {tenantSlug} placeholder'ı gerçek slug ile değiştirilir.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMenus(CancellationToken ct)
    {
        var tenantSlug = User.FindFirstValue("tenant_slug")
                       ?? User.FindFirstValue("tenantSlug");
        if (string.IsNullOrEmpty(tenantSlug))
            return Unauthorized(new { error = "Tenant bilgisi bulunamadı." });

        // Tenant'ın etkin modüllerini bul
        var tenant = await _db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == tenantSlug && t.IsActive && !t.IsDeleted, ct);

        if (tenant is null)
            return NotFound(new { error = "Tenant bulunamadı." });

        var enabledModules = (tenant.EnabledModules ?? "ecommerce")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // Aktif TR dil kaydı
        var trLang = await _db.Languages.FirstOrDefaultAsync(l => l.Code == "tr-TR", ct);

        // Etkin modüllerin tenant'a görünür menülerini çek
        var moduleIds = await _db.Modules
            .Where(m => enabledModules.Contains(m.Code) && m.IsActive)
            .Select(m => m.Id)
            .ToListAsync(ct);

        var menus = await _db.ModuleMenus
            .Include(m => m.Translations)
            .Where(m => moduleIds.Contains(m.ModuleId) && m.VisibleToTenant && !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(ct);

        var result = menus.Select(m => new StoreMenuItemDto
        {
            Id        = m.Id,
            ParentId  = m.ParentId,
            // {tenantSlug} → gerçek slug
            Path      = m.Path.Replace("{tenantSlug}", tenantSlug),
            Icon      = m.Icon ?? "FaCircle",
            IconColor = m.IconColor ?? "#6b7280",
            SortOrder = m.SortOrder,
            Title     = m.Translations
                          .FirstOrDefault(t => trLang != null && t.LanguageId == trLang.Id)?.Title
                        ?? m.Translations.FirstOrDefault()?.Title
                        ?? "Menü",
        }).ToList();

        // Hiyerarşi kur
        var map = result.ToDictionary(x => x.Id);
        var roots = new List<StoreMenuItemDto>();

        foreach (var item in result)
        {
            if (item.ParentId == null)
                roots.Add(item);
            else if (map.TryGetValue(item.ParentId.Value, out var parent))
                parent.Children.Add(item);
        }

        return Ok(roots.OrderBy(x => x.SortOrder).ToList());
    }
}

public class StoreMenuItemDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public string Path { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string? IconColor { get; set; }
    public int SortOrder { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<StoreMenuItemDto> Children { get; set; } = new();
}
