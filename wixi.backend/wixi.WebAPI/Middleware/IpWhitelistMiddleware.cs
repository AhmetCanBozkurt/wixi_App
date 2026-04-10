using System.Net;

namespace wixi.WebAPI.Middleware;

public class IpWhitelistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<IpWhitelistMiddleware> _logger;
    private readonly bool _enabled;
    private readonly HashSet<string> _whitelist;

    public IpWhitelistMiddleware(
        RequestDelegate next,
        ILogger<IpWhitelistMiddleware> logger,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _enabled = configuration.GetValue<bool>("AdminWhitelist:Enabled");
        
        var whitelist = configuration.GetSection("AdminWhitelist:IpAddresses").Get<string[]>() ?? Array.Empty<string>();
        _whitelist = new HashSet<string>(whitelist);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only check admin endpoints
        if (!context.Request.Path.StartsWithSegments("/api/v1/admin", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        // Skip if whitelist is disabled
        if (!_enabled || _whitelist.Count == 0)
        {
            await _next(context);
            return;
        }

        var remoteIp = context.Connection.RemoteIpAddress?.ToString();
        if (string.IsNullOrEmpty(remoteIp))
        {
            _logger.LogWarning("Unable to determine remote IP address");
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            await context.Response.WriteAsJsonAsync(new { message = "Access denied" });
            return;
        }

        // Check if IP is whitelisted
        if (!_whitelist.Contains(remoteIp))
        {
            _logger.LogWarning("Access denied for IP: {IpAddress} on admin endpoint: {Path}", 
                remoteIp, context.Request.Path);
            
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            await context.Response.WriteAsJsonAsync(new 
            { 
                message = "Access denied: IP not whitelisted",
                ipAddress = remoteIp
            });
            return;
        }

        _logger.LogInformation("Whitelisted IP {IpAddress} accessed admin endpoint: {Path}", 
            remoteIp, context.Request.Path);

        await _next(context);
    }
}







