using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/logs")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.ViewAuditLogs)]
public class AdminLogsController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminLogsController> _logger;

    public AdminLogsController(
        WixiDbContext context,
        ILogger<AdminLogsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get audit logs with filtering and pagination
    /// </summary>
    [HttpGet("audit")]
    public async Task<ActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? action = null,
        [FromQuery] int? userId = null,
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null)
    {
        try
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(action))
                query = query.Where(al => al.Action == action);

            if (userId.HasValue)
                query = query.Where(al => al.UserId == userId.Value);

            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
                query = query.Where(al => al.CreatedAt >= start);

            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
            {
                var endOfDay = end.Date.AddDays(1).AddTicks(-1);
                query = query.Where(al => al.CreatedAt <= endOfDay);
            }

            query = query.OrderByDescending(al => al.CreatedAt);

            var skip = (page - 1) * pageSize;
            var logs = await query
                .Skip(skip)
                .Take(pageSize)
                .Select(al => new
                {
                    al.Id,
                    al.UserId,
                    al.Action,
                    al.EntityName,
                    al.EntityId,
                    al.IpAddress,
                    al.CreatedAt
                })
                .ToListAsync();

            var total = await query.CountAsync();

            return Ok(new
            {
                items = logs,
                page,
                pageSize,
                total,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching audit logs");
            return StatusCode(500, new { message = "Error fetching logs" });
        }
    }

    /// <summary>
    /// Get audit logs statistics
    /// </summary>
    [HttpGet("audit/stats")]
    public async Task<ActionResult> GetAuditLogsStats(
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null)
    {
        try
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
                query = query.Where(al => al.CreatedAt >= start);

            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
            {
                var endOfDay = end.Date.AddDays(1).AddTicks(-1);
                query = query.Where(al => al.CreatedAt <= endOfDay);
            }

            var stats = new
            {
                total = await query.CountAsync(),
                todayCount = await query.CountAsync(al => al.CreatedAt >= DateTime.UtcNow.Date),
                uniqueUsers = await query.Select(al => al.UserId).Distinct().CountAsync(),
                topActions = await query
                    .GroupBy(al => al.Action)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .Select(g => new { action = g.Key, count = g.Count() })
                    .ToListAsync()
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching audit logs statistics");
            return StatusCode(500, new { message = "Error fetching statistics" });
        }
    }
}

