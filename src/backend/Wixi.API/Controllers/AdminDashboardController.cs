using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/admin/dashboard")]
[Authorize(Roles = "SuperAdmin,Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly WixiCoreDbContext _db;
    private readonly ILogger<AdminDashboardController> _logger;

    public AdminDashboardController(WixiCoreDbContext db, ILogger<AdminDashboardController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var firstOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // EF Core DbContext is not thread-safe — run queries sequentially
        var totalTenants        = await _db.Tenants.CountAsync(t => !t.IsDeleted, ct);
        var activeTenants       = await _db.Tenants.CountAsync(t => !t.IsDeleted && t.IsActive, ct);
        var newTenantsThisMonth = await _db.Tenants.CountAsync(t => !t.IsDeleted && t.CreatedAt >= firstOfMonth, ct);
        var totalUsers          = await _db.Users.CountAsync(ct);

        var trialCount     = await _db.TenantSubscriptions.CountAsync(s => s.Status == "Trial", ct);
        var activeCount    = await _db.TenantSubscriptions.CountAsync(s => s.Status == "Active", ct);
        var cancelledCount = await _db.TenantSubscriptions.CountAsync(s => s.Status == "Cancelled", ct);
        var pastDueCount   = await _db.TenantSubscriptions.CountAsync(s => s.Status == "PastDue", ct);

        var totalRevenue = await _db.PaymentTransactions
            .Where(p => p.Status == "Succeeded" && p.Currency == "TRY")
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var revenueThisMonth = await _db.PaymentTransactions
            .Where(p => p.Status == "Succeeded" && p.Currency == "TRY" && p.CreatedAt >= firstOfMonth)
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        // Plan distribution — group active subscriptions by plan
        var planGroups = await _db.TenantSubscriptions
            .AsNoTracking()
            .Where(s => s.Status == "Active" || s.Status == "Trial")
            .Include(s => s.Plan)
            .GroupBy(s => new { s.Plan.Name, s.Plan.Code })
            .Select(g => new { g.Key.Name, g.Key.Code, Count = g.Count() })
            .ToListAsync(ct);

        var totalSubscribed = planGroups.Sum(g => g.Count);
        var planDistribution = planGroups
            .OrderBy(g => g.Code)
            .Select(g => new
            {
                planName   = g.Name,
                code       = g.Code,
                count      = g.Count,
                percentage = totalSubscribed == 0
                    ? 0.0
                    : Math.Round((double)g.Count / totalSubscribed * 100.0, 1)
            })
            .ToList();

        // Recent 5 tenants with their latest subscription
        var recentTenants = await _db.Tenants
            .AsNoTracking()
            .Where(t => !t.IsDeleted)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .Select(t => new
            {
                id        = t.Id,
                name      = t.Name,
                slug      = t.Slug,
                createdAt = t.CreatedAt,
                latestSub = _db.TenantSubscriptions
                    .Where(s => s.TenantId == t.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(s => new { s.Status, PlanName = s.Plan.Name })
                    .FirstOrDefault()
            })
            .ToListAsync(ct);

        var recentTenantsResult = recentTenants.Select(t => new
        {
            id        = t.id,
            name      = t.name,
            slug      = t.slug,
            plan      = t.latestSub?.PlanName ?? "—",
            status    = t.latestSub?.Status ?? "—",
            createdAt = t.createdAt
        });

        _logger.LogInformation("Admin dashboard stats fetched successfully");

        return Ok(new
        {
            totalTenants,
            activeTenants,
            newTenantsThisMonth,
            totalUsers,
            subscriptionsByStatus = new
            {
                trial     = trialCount,
                active    = activeCount,
                cancelled = cancelledCount,
                pastDue   = pastDueCount
            },
            planDistribution,
            totalRevenue,
            revenueThisMonth,
            recentTenants = recentTenantsResult
        });
    }
}
