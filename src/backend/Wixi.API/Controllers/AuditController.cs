using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.API.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class AuditController : ControllerBase
{
    private readonly WixiCoreDbContext _context;

    public AuditController(WixiCoreDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int[]? logType, 
        [FromQuery] string? action,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.AuditLogs
            .Where(l => !l.IsDeleted);

        if (logType != null && logType.Length > 0)
        {
            var types = logType.Select(t => (LogType)t).ToList();
            query = query.Where(l => types.Contains(l.LogType));
        }

        if (!string.IsNullOrEmpty(action) && action != "all")
            query = query.Where(l => l.Action == action);

        if (startDate.HasValue)
            query = query.Where(l => l.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(l => l.CreatedAt <= endOfDay);
        }

        var logs = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(1000)
            .Select(l => new {
                l.Id,
                l.Action,
                l.LogType,
                l.TableName,
                l.EntityId,
                l.OldValues,
                l.NewValues,
                l.AffectedColumns,
                l.Details,
                l.IpAddress,
                l.CreatedAt,
                l.FullName,
                Email = l.Email ?? "System"
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var baseQuery = _context.AuditLogs.Where(l => !l.IsDeleted);

        // Filtered Query for total/errors/warnings
        var filteredQuery = baseQuery;
        if (startDate.HasValue)
        {
            var startUtc = startDate.Value.ToUniversalTime();
            filteredQuery = filteredQuery.Where(l => l.CreatedAt >= startUtc);
        }
        if (endDate.HasValue)
        {
            var endUtc = endDate.Value.Date.AddDays(1).AddTicks(-1).ToUniversalTime();
            filteredQuery = filteredQuery.Where(l => l.CreatedAt <= endUtc);
        }

        var total = await filteredQuery.CountAsync();
        
        // Accurate severity detection with null-safety
        var errors = await filteredQuery.CountAsync(l => 
            (l.Action != null && (l.Action.Contains("FAILED") || l.Action.Contains("ERROR") || l.Action.Contains("CRITICAL"))) ||
            (l.LogType == LogType.System && l.Details != null && (l.Details.Contains("Error") || l.Details.Contains("Exception")))
        );

        var warnings = await filteredQuery.CountAsync(l => 
            (l.Action != null && (
                l.Action.Contains("WARN") || 
                l.Action.Contains("UNAUTHORIZED") || 
                l.Action.Contains("REJECTED") ||
                l.Action.Contains("UPDATE") ||
                l.Action.Contains("MODIFIED") ||
                l.Action.Contains("DELETE")
            ))
        );

        var info = total - errors - warnings;
        
        // Today count (Always based on current date)
        var todayStart = DateTime.UtcNow.Date;
        var todayCount = await _context.AuditLogs.CountAsync(l => !l.IsDeleted && l.CreatedAt >= todayStart);

        return Ok(new {
            total,
            errors,
            warnings,
            info,
            todayCount
        });
    }

    [HttpPost("log-activity")]
    public async Task<IActionResult> LogActivity([FromBody] ActivityLogRequest request)
    {
        await _context.LogActivityAsync(
            request.Action, 
            request.TableName, 
            request.EntityId, 
            request.Details, 
            (LogType)request.LogType);

        return Ok();
    }
}

public class ActivityLogRequest
{
    public string Action { get; set; } = null!;
    public string? TableName { get; set; }
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public int LogType { get; set; } = 3; // Default 3 = Activity
}
