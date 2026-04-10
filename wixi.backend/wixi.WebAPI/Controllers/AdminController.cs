using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        WixiDbContext context,
        IAuditLogService auditLogService,
        ILogger<AdminController> logger)
    {
        _context = context;
        _auditLogService = auditLogService;
        _logger = logger;
    }

    /// <summary>
    /// Get audit logs (Admin only)
    /// </summary>
    [HttpGet("audit-logs")]
    [Authorize(Policy = Policies.ViewAuditLogs)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? action = null,
        [FromQuery] int? userId = null)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(action))
            query = query.Where(al => al.Action == action);

        if (userId.HasValue)
            query = query.Where(al => al.UserId == userId.Value);

        var logs = await query
            .OrderByDescending(al => al.CreatedAt)
            .Skip((page - 1) * pageSize)
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
            data = logs,
            pagination = new
            {
                page,
                pageSize,
                total,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            }
        });
    }

    /// <summary>
    /// Get system statistics (Admin only)
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        var stats = new
        {
            totalUsers = await _context.Users.CountAsync(),
            activeUsers = await _context.Users.CountAsync(u => u.IsActive),
            totalRoles = await _context.Roles.CountAsync(),
            activeRefreshTokens = await _context.RefreshTokens.CountAsync(rt => rt.IsRevoked == false && rt.ExpiresAt > DateTime.UtcNow),
            auditLogsToday = await _context.AuditLogs.CountAsync(al => al.CreatedAt.Date == DateTime.UtcNow.Date),
            lastLogins = await _context.Users
                .Where(u => u.LastLoginAt != null)
                .OrderByDescending(u => u.LastLoginAt)
                .Take(5)
                .Select(u => new
                {
                    u.Email,
                    u.LastLoginAt
                })
                .ToListAsync()
        };

        return Ok(stats);
    }
}

