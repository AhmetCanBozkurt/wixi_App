using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/admin/theme-management")]
[Authorize(Roles = "SuperAdmin,Admin")]
public class AdminThemeManagementController : ControllerBase
{
    private readonly WixiCoreDbContext _coreDb;

    public AdminThemeManagementController(WixiCoreDbContext coreDb)
    {
        _coreDb = coreDb;
    }

    // ── Stores (Tenant List) ──────────────────────────────────────────────────

    [HttpGet("stores")]
    public async Task<IActionResult> GetStores(CancellationToken ct)
    {
        var tenants = await _coreDb.Tenants
            .AsNoTracking()
            .Where(t => !t.IsDeleted && t.IsMigrated)
            .OrderBy(t => t.Name)
            .Select(t => new
            {
                id        = t.Id,
                name      = t.Name,
                slug      = t.Slug,
                plan      = t.Plan,
                isActive  = t.IsActive,
                updatedAt = t.UpdatedAt,
            })
            .ToListAsync(ct);

        return Ok(tenants);
    }

    // ── Per-Tenant Theme Operations ───────────────────────────────────────────

    [HttpGet("stores/{tenantId:guid}/theme")]
    public async Task<IActionResult> GetTenantTheme(Guid tenantId, CancellationToken ct)
    {
        using var db = await GetTenantDbAsync(tenantId, ct);
        if (db == null) return NotFound(new { error = "Tenant bulunamadı veya DB henüz hazır değil." });

        var settings = await db.StoreSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        if (settings == null) return NotFound(new { error = "Tenant ayarları bulunamadı." });

        return Ok(new
        {
            themeConfigJson = settings.ThemeConfigJson,
            globalComponentsConfigJson = settings.GlobalComponentsConfigJson,
            customCssOverride = settings.CustomCssOverride,
            customJsOverride = settings.CustomJsOverride,
            updatedAt = settings.UpdatedAt,
        });
    }

    [HttpPut("stores/{tenantId:guid}/theme")]
    public async Task<IActionResult> UpdateTenantTheme(Guid tenantId, [FromBody] AdminUpdateThemeRequest req, CancellationToken ct)
    {
        using var db = await GetTenantDbAsync(tenantId, ct);
        if (db == null) return NotFound(new { error = "Tenant bulunamadı." });

        var settings = await db.StoreSettings.FirstOrDefaultAsync(ct);
        if (settings == null) return NotFound(new { error = "Tenant ayarları bulunamadı." });

        if (req.ThemeConfigJson != null)            settings.ThemeConfigJson = req.ThemeConfigJson;
        if (req.GlobalComponentsConfigJson != null) settings.GlobalComponentsConfigJson = req.GlobalComponentsConfigJson;
        if (req.CustomCssOverride != null)           settings.CustomCssOverride = req.CustomCssOverride;
        settings.UpdatedAt = DateTime.UtcNow;
        settings.UpdatedByUser = User.Identity?.Name;

        await UnpublishExistingVersions(db, settings.Id, ct);
        var maxVersion = await db.ThemeVersions
            .Where(v => v.StoreSettingsId == settings.Id)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        db.ThemeVersions.Add(new WixiThemeVersion
        {
            StoreSettingsId            = settings.Id,
            VersionNumber              = maxVersion + 1,
            ThemeConfigJson            = settings.ThemeConfigJson,
            GlobalComponentsConfigJson = settings.GlobalComponentsConfigJson,
            CustomCssOverride          = settings.CustomCssOverride,
            CustomJsOverride           = settings.CustomJsOverride,
            VersionType                = "super_admin",
            IsPublished                = true,
            ChangedByEmail             = User.Identity?.Name,
            CreatedAt                  = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("stores/{tenantId:guid}/versions")]
    public async Task<IActionResult> GetTenantVersions(Guid tenantId, CancellationToken ct)
    {
        using var db = await GetTenantDbAsync(tenantId, ct);
        if (db == null) return NotFound(new { error = "Tenant bulunamadı." });

        var versions = await db.ThemeVersions
            .AsNoTracking()
            .OrderByDescending(v => v.VersionNumber)
            .Take(100)
            .Select(v => new
            {
                v.Id,
                v.VersionNumber,
                v.VersionLabel,
                v.VersionType,
                v.IsPublished,
                v.RestoredFromVersionId,
                v.ChangedByEmail,
                v.CreatedAt,
            })
            .ToListAsync(ct);

        return Ok(versions);
    }

    [HttpPost("stores/{tenantId:guid}/versions/{versionId:int}/rollback")]
    public async Task<IActionResult> RollbackTenantVersion(Guid tenantId, int versionId, CancellationToken ct)
    {
        using var db = await GetTenantDbAsync(tenantId, ct);
        if (db == null) return NotFound(new { error = "Tenant bulunamadı." });

        var targetVersion = await db.ThemeVersions.AsNoTracking().FirstOrDefaultAsync(v => v.Id == versionId, ct);
        if (targetVersion == null) return NotFound(new { error = "Versiyon bulunamadı." });

        var settings = await db.StoreSettings.FirstOrDefaultAsync(ct);
        if (settings == null) return NotFound(new { error = "Tenant ayarları bulunamadı." });

        settings.ThemeConfigJson            = targetVersion.ThemeConfigJson;
        settings.GlobalComponentsConfigJson = targetVersion.GlobalComponentsConfigJson;
        settings.CustomCssOverride          = targetVersion.CustomCssOverride;
        settings.CustomJsOverride           = targetVersion.CustomJsOverride;
        settings.UpdatedAt                  = DateTime.UtcNow;
        settings.UpdatedByUser              = User.Identity?.Name;

        await UnpublishExistingVersions(db, settings.Id, ct);
        var maxVersion = await db.ThemeVersions
            .Where(v => v.StoreSettingsId == settings.Id)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        db.ThemeVersions.Add(new WixiThemeVersion
        {
            StoreSettingsId            = settings.Id,
            VersionNumber              = maxVersion + 1,
            ThemeConfigJson            = settings.ThemeConfigJson,
            GlobalComponentsConfigJson = settings.GlobalComponentsConfigJson,
            CustomCssOverride          = settings.CustomCssOverride,
            CustomJsOverride           = settings.CustomJsOverride,
            VersionType                = "super_admin",
            VersionLabel               = $"v{targetVersion.VersionNumber}'den geri alındı",
            IsPublished                = true,
            RestoredFromVersionId      = versionId,
            ChangedByEmail             = User.Identity?.Name,
            CreatedAt                  = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Bulk Apply ────────────────────────────────────────────────────────────

    [HttpPost("bulk-apply")]
    public async Task<IActionResult> BulkApply([FromBody] BulkApplyRequest req, CancellationToken ct)
    {
        var template = await _coreDb.ThemeTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == req.TemplateId && !t.IsDeleted, ct);

        if (template == null) return NotFound(new { error = "Şablon bulunamadı." });

        int success = 0, failed = 0;

        foreach (var tenantId in req.TenantIds)
        {
            try
            {
                using var db = await GetTenantDbAsync(tenantId, ct);
                if (db == null) { failed++; continue; }

                var settings = await db.StoreSettings.FirstOrDefaultAsync(ct);
                if (settings == null) { failed++; continue; }

                if (template.ThemeConfigJson != null)            settings.ThemeConfigJson = template.ThemeConfigJson;
                if (template.GlobalComponentsConfigJson != null) settings.GlobalComponentsConfigJson = template.GlobalComponentsConfigJson;
                if (template.CustomCssOverride != null)           settings.CustomCssOverride = template.CustomCssOverride;
                settings.UpdatedAt     = DateTime.UtcNow;
                settings.UpdatedByUser = User.Identity?.Name;

                await UnpublishExistingVersions(db, settings.Id, ct);
                var maxVersion = await db.ThemeVersions
                    .Where(v => v.StoreSettingsId == settings.Id)
                    .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

                db.ThemeVersions.Add(new WixiThemeVersion
                {
                    StoreSettingsId            = settings.Id,
                    VersionNumber              = maxVersion + 1,
                    ThemeConfigJson            = settings.ThemeConfigJson,
                    GlobalComponentsConfigJson = settings.GlobalComponentsConfigJson,
                    CustomCssOverride          = settings.CustomCssOverride,
                    CustomJsOverride           = settings.CustomJsOverride,
                    VersionType                = "super_admin",
                    VersionLabel               = $"Şablon uygulandı: {template.Name}",
                    IsPublished                = true,
                    ChangedByEmail             = User.Identity?.Name,
                    CreatedAt                  = DateTime.UtcNow,
                });
                await db.SaveChangesAsync(ct);
                success++;
            }
            catch
            {
                failed++;
            }
        }

        return Ok(new { success, failed });
    }

    // ── Templates CRUD ────────────────────────────────────────────────────────

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates(CancellationToken ct)
    {
        var templates = await _coreDb.ThemeTemplates
            .AsNoTracking()
            .Where(t => !t.IsDeleted)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new { t.Id, t.Name, t.Description, t.PreviewImageUrl, t.IsDefault, t.IsActive, t.CreatedAt })
            .ToListAsync(ct);

        return Ok(templates);
    }

    [HttpGet("templates/{id:int}")]
    public async Task<IActionResult> GetTemplate(int id, CancellationToken ct)
    {
        var template = await _coreDb.ThemeTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct);

        if (template == null) return NotFound();
        return Ok(template);
    }

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateThemeTemplateRequest req, CancellationToken ct)
    {
        var template = new WixiThemeTemplate
        {
            Name                       = req.Name,
            Description                = req.Description,
            PreviewImageUrl            = req.PreviewImageUrl,
            ThemeConfigJson            = req.ThemeConfigJson,
            GlobalComponentsConfigJson = req.GlobalComponentsConfigJson,
            CustomCssOverride          = req.CustomCssOverride,
            IsDefault                  = req.IsDefault,
            IsActive                   = true,
        };
        _coreDb.ThemeTemplates.Add(template);
        await _coreDb.SaveChangesAsync(ct);
        return Ok(new { id = template.Id });
    }

    [HttpPut("templates/{id:int}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] CreateThemeTemplateRequest req, CancellationToken ct)
    {
        var template = await _coreDb.ThemeTemplates.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, ct);
        if (template == null) return NotFound();

        template.Name                       = req.Name;
        template.Description                = req.Description;
        template.PreviewImageUrl            = req.PreviewImageUrl;
        template.ThemeConfigJson            = req.ThemeConfigJson;
        template.GlobalComponentsConfigJson = req.GlobalComponentsConfigJson;
        template.CustomCssOverride          = req.CustomCssOverride;
        template.IsDefault                  = req.IsDefault;

        await _coreDb.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("templates/{id:int}")]
    public async Task<IActionResult> DeleteTemplate(int id, CancellationToken ct)
    {
        var template = await _coreDb.ThemeTemplates.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (template == null) return NotFound();

        template.IsDeleted = true;
        await _coreDb.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<ECommerceDbContext?> GetTenantDbAsync(Guid tenantId, CancellationToken ct)
    {
        var tenant = await _coreDb.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId && !t.IsDeleted, ct);

        if (tenant == null || string.IsNullOrEmpty(tenant.ConnectionString)) return null;

        var options = new DbContextOptionsBuilder<ECommerceDbContext>()
            .UseSqlServer(tenant.ConnectionString)
            .Options;

        var tenantContext = new TenantContext();
        tenantContext.Set(tenant.Id, tenant.ConnectionString, tenant.Slug);
        return new ECommerceDbContext(options, tenantContext);
    }

    private static async Task UnpublishExistingVersions(ECommerceDbContext db, Guid storeSettingsId, CancellationToken ct)
    {
        await db.ThemeVersions
            .Where(v => v.StoreSettingsId == storeSettingsId && v.IsPublished)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.IsPublished, false), ct);
    }
}

// ── Request Models ────────────────────────────────────────────────────────────

public record AdminUpdateThemeRequest(
    string? ThemeConfigJson,
    string? GlobalComponentsConfigJson,
    string? CustomCssOverride);

public record BulkApplyRequest(int TemplateId, List<Guid> TenantIds);

public record CreateThemeTemplateRequest(
    string Name,
    string? Description,
    string? PreviewImageUrl,
    string? ThemeConfigJson,
    string? GlobalComponentsConfigJson,
    string? CustomCssOverride,
    bool IsDefault = false);
