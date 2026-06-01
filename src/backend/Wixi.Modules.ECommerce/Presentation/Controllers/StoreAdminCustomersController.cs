using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

/// <summary>
/// Read-only customer management endpoints for the store admin panel.
/// Write operations (password reset, etc.) are handled by dedicated commands.
/// </summary>
[ApiController]
[Route("api/v1/store-admin/customers")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminCustomersController : ControllerBase
{
    private readonly ECommerceDbContext _db;

    public StoreAdminCustomersController(ECommerceDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Returns a paginated list of customers, filterable by email or name.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _db.Customers
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(c =>
                c.Email.ToLower().Contains(s)
                || c.FirstName.ToLower().Contains(s)
                || c.LastName.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerListDto(
                c.Id,
                c.FirstName,
                c.LastName,
                c.Email,
                c.PhoneNumber,
                c.IsEmailVerified,
                c.IsActive,
                c.CreatedAt))
            .ToListAsync(ct);

        return Ok(new
        {
            items,
            totalCount,
            page,
            pageSize
        });
    }

    /// <summary>
    /// Returns detailed information about a single customer.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var customer = await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == id && !c.IsDeleted)
            .Select(c => new CustomerDetailDto(
                c.Id,
                c.FirstName,
                c.LastName,
                c.Email,
                c.PhoneNumber,
                c.IsEmailVerified,
                c.IsActive,
                c.CreatedAt,
                c.UpdatedAt))
            .FirstOrDefaultAsync(ct);

        if (customer is null)
            return NotFound(new { error = "Müşteri bulunamadı." });

        return Ok(customer);
    }
}

// ── Response DTOs ──────────────────────────────────────────────────────

public record CustomerListDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    bool IsEmailVerified,
    bool IsActive,
    DateTime CreatedAt);

public record CustomerDetailDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    bool IsEmailVerified,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
