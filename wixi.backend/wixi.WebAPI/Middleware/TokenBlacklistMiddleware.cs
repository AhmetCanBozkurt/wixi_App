using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;

namespace wixi.WebAPI.Middleware;

/// <summary>
/// Middleware to check if JWT token is blacklisted
/// Prevents revoked tokens from being used
/// </summary>
public class TokenBlacklistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TokenBlacklistMiddleware> _logger;

    public TokenBlacklistMiddleware(
        RequestDelegate next,
        ILogger<TokenBlacklistMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, WixiDbContext dbContext)
    {
        // Skip if no authorization header
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        // Extract token
        var token = authHeader.Substring("Bearer ".Length).Trim();
        if (string.IsNullOrEmpty(token))
        {
            await _next(context);
            return;
        }

        try
        {
            // Check if token is blacklisted
            var isBlacklisted = await dbContext.TokenBlacklists
                .AnyAsync(t => t.Token == token && t.ExpirationDate > DateTime.UtcNow);

            if (isBlacklisted)
            {
                _logger.LogWarning("Blacklisted token attempted to access {Path} from {IP}", 
                    context.Request.Path, 
                    context.Connection.RemoteIpAddress);

                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                
                var error = System.Text.Json.JsonSerializer.Serialize(new
                {
                    message = "Token has been revoked. Please login again.",
                    error = "token_revoked"
                });
                
                await context.Response.WriteAsync(error);
                return;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking token blacklist for {Path}", context.Request.Path);
            // Don't block request on blacklist check failure - let it through
            // This prevents service disruption if database is temporarily unavailable
        }

        await _next(context);
    }
}

