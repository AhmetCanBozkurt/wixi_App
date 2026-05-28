using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/subscriptions")]
[Authorize(Roles = "SuperAdmin,Admin")]
public class AdminSubscriptionsController : ControllerBase
{
    private readonly WixiCoreDbContext _coreDb;
    private readonly ILogger<AdminSubscriptionsController> _logger;

    public AdminSubscriptionsController(
        WixiCoreDbContext coreDb,
        ILogger<AdminSubscriptionsController> logger)
    {
        _coreDb = coreDb;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetSubscriptions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var query = _coreDb.TenantSubscriptions
            .AsNoTracking()
            .Include(s => s.Tenant)
            .Include(s => s.Plan)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(s =>
                s.Tenant.Name.ToLower().Contains(lower) ||
                s.Tenant.Slug.ToLower().Contains(lower) ||
                s.Tenant.OwnerEmail.ToLower().Contains(lower));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                tenantId        = s.TenantId,
                tenantName      = s.Tenant.Name,
                tenantSlug      = s.Tenant.Slug,
                ownerEmail      = s.Tenant.OwnerEmail,
                planName        = s.Plan.Name,
                status          = s.Status,
                currentPeriodEnd = s.CurrentPeriodEnd,
                billingInterval = s.BillingInterval,
                createdAt       = s.CreatedAt
            })
            .ToListAsync(ct);

        var totalCount     = await _coreDb.TenantSubscriptions.CountAsync(ct);
        var activeCount    = await _coreDb.TenantSubscriptions.CountAsync(s => s.Status == "Active", ct);
        var trialCount     = await _coreDb.TenantSubscriptions.CountAsync(s => s.Status == "Trial", ct);
        var pastDueCount   = await _coreDb.TenantSubscriptions.CountAsync(s => s.Status == "PastDue", ct);
        var cancelledCount = await _coreDb.TenantSubscriptions.CountAsync(s => s.Status == "Cancelled", ct);

        _logger.LogInformation("Admin subscriptions list fetched: page={Page}, status={Status}", page, status);

        return Ok(new
        {
            items,
            total,
            page,
            pageSize,
            stats = new
            {
                total     = totalCount,
                active    = activeCount,
                trial     = trialCount,
                pastDue   = pastDueCount,
                cancelled = cancelledCount
            }
        });
    }
}
