using wixi.DataAccess;
using wixi.Identity.Entities;

namespace wixi.WebAPI.Services;

public interface IAuditLogService
{
    Task LogAsync(int? userId, string action, string entityName, string? entityId = null, 
        object? oldValues = null, object? newValues = null, string? ipAddress = null, string? userAgent = null);
}

public class AuditLogService : IAuditLogService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(WixiDbContext context, ILogger<AuditLogService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogAsync(int? userId, string action, string entityName, string? entityId = null, 
        object? oldValues = null, object? newValues = null, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                OldValues = oldValues != null ? System.Text.Json.JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? System.Text.Json.JsonSerializer.Serialize(newValues) : null,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Audit log created: {Action} on {EntityName} by user {UserId}", 
                action, entityName, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create audit log for {Action} on {EntityName}", action, entityName);
            // Don't throw - audit logging failure shouldn't break the application
        }
    }
}

