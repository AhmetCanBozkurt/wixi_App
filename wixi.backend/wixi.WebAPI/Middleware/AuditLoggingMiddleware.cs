using System.Security.Claims;
using System.Text;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Middleware;

/// <summary>
/// Middleware to log critical actions for security audit purposes
/// </summary>
public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLoggingMiddleware> _logger;
    private static readonly HashSet<string> AuditMethods = new() { "POST", "PUT", "DELETE", "PATCH" };
    
    // Endpoints that should be audited
    private static readonly HashSet<string> AuditEndpoints = new()
    {
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/refresh",
        "/api/v1/auth/revoke",
        "/api/v1/admin/users",
        "/api/v1/admin/audit-logs",
        "/api/v1/admin/users/deactivate",
        "/api/v1/admin/roles"
    };

    public AuditLoggingMiddleware(
        RequestDelegate next,
        ILogger<AuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IAuditLogService auditLogService)
    {
        var shouldAudit = ShouldAuditRequest(context);
        
        if (!shouldAudit)
        {
            await _next(context);
            return;
        }

        // Capture request body
        string? requestBody = null;
        if (context.Request.ContentLength > 0)
        {
            context.Request.EnableBuffering();
            using var reader = new StreamReader(
                context.Request.Body,
                encoding: Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                bufferSize: 1024,
                leaveOpen: true);
            
            requestBody = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;
        }

        // Capture response body
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        var startTime = DateTime.UtcNow;
        Exception? exception = null;

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            exception = ex;
            throw;
        }
        finally
        {
            // Log the audit trail
            await LogAuditTrail(
                context,
                auditLogService,
                requestBody,
                startTime,
                exception);

            // Copy the response back to the original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
    }

    private bool ShouldAuditRequest(HttpContext context)
    {
        // Audit specific methods
        if (!AuditMethods.Contains(context.Request.Method))
        {
            return false;
        }

        var path = context.Request.Path.Value?.ToLower() ?? string.Empty;

        // Audit specific endpoints
        foreach (var endpoint in AuditEndpoints)
        {
            if (path.StartsWith(endpoint.ToLower()))
            {
                return true;
            }
        }

        // Audit admin endpoints
        if (path.Contains("/admin/"))
        {
            return true;
        }

        return false;
    }

    private async Task LogAuditTrail(
        HttpContext context,
        IAuditLogService auditLogService,
        string? requestBody,
        DateTime startTime,
        Exception? exception)
    {
        try
        {
            var userId = GetUserId(context);
            var action = $"{context.Request.Method} {context.Request.Path}";
            var entityName = ExtractEntityName(context.Request.Path.Value ?? string.Empty);
            var ipAddress = context.Connection.RemoteIpAddress?.ToString();
            var userAgent = context.Request.Headers["User-Agent"].ToString();
            var statusCode = context.Response.StatusCode;

            // Read response body
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
            context.Response.Body.Seek(0, SeekOrigin.Begin);

            // Sanitize sensitive data
            var sanitizedRequest = SanitizeSensitiveData(requestBody);
            var sanitizedResponse = SanitizeSensitiveData(responseBody);

            var newValues = exception == null 
                ? $"Status: {statusCode}, Request: {sanitizedRequest}, Response: {sanitizedResponse}"
                : $"Status: {statusCode}, Error: {exception.Message}";

            await auditLogService.LogAsync(
                userId: userId,
                action: action,
                entityName: entityName,
                entityId: null,
                oldValues: null,
                newValues: newValues,
                ipAddress: ipAddress,
                userAgent: userAgent
            );

            _logger.LogInformation(
                "Audit: User {UserId} performed {Action} on {EntityName} from {IpAddress} - Status: {StatusCode}",
                userId?.ToString() ?? "Anonymous",
                action,
                entityName,
                ipAddress,
                statusCode);
        }
        catch (Exception ex)
        {
            // Don't break the pipeline if audit logging fails
            _logger.LogError(ex, "Failed to log audit trail");
        }
    }

    private int? GetUserId(HttpContext context)
    {
        var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private string ExtractEntityName(string path)
    {
        // Extract entity name from path
        // e.g., /api/v1/admin/users → Users
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        return segments.Length > 0 ? segments[^1] : "Unknown";
    }

    private string? SanitizeSensitiveData(string? data)
    {
        if (string.IsNullOrEmpty(data))
        {
            return data;
        }

        // Remove passwords, tokens, and other sensitive fields
        var sensitiveFields = new[] { "password", "token", "refreshtoken", "secret", "key", "apikey" };
        
        var sanitized = data;
        foreach (var field in sensitiveFields)
        {
            // Simple regex replacement - in production, use proper JSON parsing
            sanitized = System.Text.RegularExpressions.Regex.Replace(
                sanitized,
                $@"""{field}"":\s*""[^""]*""",
                $@"""{field}"":""***REDACTED***""",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }

        return sanitized;
    }
}

