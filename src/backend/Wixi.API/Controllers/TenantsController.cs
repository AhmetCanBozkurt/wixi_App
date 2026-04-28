using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers;

/// <summary>
/// Platform çapında Tenant yönetimi — SuperAdmin erişimi.
/// </summary>
[ApiController]
[Route("api/v1/admin/tenants")]
[Authorize(Roles = "SuperAdmin")]
public class TenantsController : ControllerBase
{
    private readonly WixiCoreDbContext _coreDb;

    public TenantsController(WixiCoreDbContext coreDb)
    {
        _coreDb = coreDb;
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
}
