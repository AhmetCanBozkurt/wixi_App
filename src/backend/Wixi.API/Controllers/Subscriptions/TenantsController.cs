using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers.Subscriptions;

/// <summary>
/// Platform çapında Tenant yönetimi — SuperAdmin erişimi.
/// </summary>
[ApiController]
[Route("api/v1/admin/tenants")]
[Authorize(Roles = "SuperAdmin")]
public class TenantsController : ControllerBase
{
    private readonly WixiCoreDbContext _coreDb;
    private readonly IEnumerable<ITenantProvisioner> _provisioners;
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(
        WixiCoreDbContext coreDb,
        IEnumerable<ITenantProvisioner> provisioners,
        ILogger<TenantsController> logger)
    {
        _coreDb = coreDb;
        _provisioners = provisioners;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var query = _coreDb.Tenants
            .AsNoTracking()
            .Where(t => !t.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => t.Name.Contains(search) || t.Slug.Contains(search) || t.OwnerEmail.Contains(search));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    [HttpPost("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        var tenant = await _coreDb.Tenants.FindAsync(id);
        if (tenant == null) return NotFound();

        tenant.IsActive = !tenant.IsActive;
        await _coreDb.SaveChangesAsync();

        return Ok(new { message = $"Tenant status updated: {tenant.IsActive}", isActive = tenant.IsActive });
    }

    /// <summary>
    /// DB provision'ı başarısız olan veya hiç çalışmamış tenant için yeniden provision eder.
    /// </summary>
    [HttpPost("{id}/reprovision")]
    public async Task<IActionResult> Reprovision(Guid id, CancellationToken ct)
    {
        var tenant = await _coreDb.Tenants.FindAsync([id], ct);
        if (tenant == null || tenant.IsDeleted) return NotFound();

        if (string.IsNullOrWhiteSpace(tenant.ConnectionString) || string.IsNullOrWhiteSpace(tenant.DatabaseName))
            return BadRequest(new { error = "Tenant'ın ConnectionString veya DatabaseName alanı boş." });

        // Reprovision tüm kayıtlı provisioner'ları çalıştırır — EnabledModules filtresi uygulanmaz.
        // Bu sayede eksik kalmış modüller (ör. webbuilder) retroaktif olarak eklenir.
        string? provisionError = null;
        try
        {
            foreach (var provisioner in _provisioners)
            {
                await provisioner.ProvisionAsync(tenant.Id.ToString(), tenant.ConnectionString, tenant.DatabaseName, ct);
            }

            // EnabledModules'ü tüm provisioner isimleriyle güncelle
            var allModuleNames = _provisioners.Select(p => p.ModuleName).Append("core").Distinct();
            tenant.EnabledModules = string.Join(",", allModuleNames);

            tenant.IsMigrated = true;
            tenant.LastMigrationError = null;
            _logger.LogInformation("Tenant {Slug} re-provisioned successfully", tenant.Slug);
        }
        catch (Exception ex)
        {
            provisionError = ex.Message;
            tenant.IsMigrated = false;
            tenant.LastMigrationError = ex.Message;
            _logger.LogError(ex, "Re-provision failed for tenant {Slug}", tenant.Slug);
        }

        await _coreDb.SaveChangesAsync(ct);

        if (provisionError is not null)
            return StatusCode(500, new { error = "Provision başarısız.", detail = provisionError });

        return Ok(new { message = $"Tenant '{tenant.Slug}' başarıyla provision edildi.", databaseName = tenant.DatabaseName });
    }

    /// <summary>
    /// Tenant kaydını soft-delete yapar ve tenant DB'sini tamamen siler.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var tenant = await _coreDb.Tenants.FindAsync(id);
        if (tenant == null || tenant.IsDeleted) return NotFound();

        // Tenant DB'sini drop et
        if (!string.IsNullOrWhiteSpace(tenant.DatabaseName))
        {
            try
            {
                var masterConnStr = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(
                    _coreDb.Database.GetConnectionString()!)
                {
                    InitialCatalog = "master"
                }.ConnectionString;

                using var conn = new Microsoft.Data.SqlClient.SqlConnection(masterConnStr);
                await conn.OpenAsync();

                var safeName = tenant.DatabaseName.Replace("]", "]]");
                var safeNameLiteral = tenant.DatabaseName.Replace("'", "''");
                using var cmd = conn.CreateCommand();
                cmd.CommandText = $"""
                    IF DB_ID(N'{safeNameLiteral}') IS NOT NULL
                    BEGIN
                        ALTER DATABASE [{safeName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                        DROP DATABASE [{safeName}];
                    END
                    """;
                await cmd.ExecuteNonQueryAsync();
                _logger.LogInformation("Tenant DB dropped: {DbName}", tenant.DatabaseName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Could not drop tenant DB {DbName}: {Message}", tenant.DatabaseName, ex.Message);
                // DB drop başarısız olsa bile kaydı silmeye devam et
            }
        }

        tenant.IsDeleted = true;
        tenant.IsActive = false;
        await _coreDb.SaveChangesAsync();

        return NoContent();
    }
}
