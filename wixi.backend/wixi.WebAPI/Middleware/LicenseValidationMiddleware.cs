using wixi.WebAPI.Services;

namespace wixi.WebAPI.Middleware;

/// <summary>
/// Middleware to validate license on each request
/// </summary>
public class LicenseValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LicenseValidationMiddleware> _logger;

    // Routes that should bypass license check
    private static readonly string[] BypassPaths = new[]
    {
        "/health",
        "/api/health",
        "/swagger",
        "/api/license/status", // Public license status endpoint
        "/api/v1.0/license/status",
        "/api/v1.0/admin/license/validate", // Allow license validation
        "/api/v1.0/admin/license/status",
        "/api/v1.0/admin/license/cache/clear", // Allow cache clearing
        "/api/auth/login", // Allow login to enter license key
        "/api/v1.0/auth/login",
        "/api/v1.0/i18n", // Allow public translations (i18n endpoint) for license-key page
        "/api/v1.0/auth/register" // Allow registration
    };

    // Admin routes that require license
    private static readonly string[] AdminPaths = new[]
    {
        "/admin",
        "/api/v1.0/admin"
    };

    // Public routes that require license
    private static readonly string[] PublicPaths = new[]
    {
        "/",
        "/api/v1.0/public"
    };

    public LicenseValidationMiddleware(
        RequestDelegate next,
        ILogger<LicenseValidationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ILicenseService licenseService)
    {
        // Get path without query string for comparison
        var path = context.Request.Path.Value ?? "";
        var pathWithoutQuery = path.Split('?')[0].ToLower();

        // Check if path should bypass license check
        var shouldBypass = ShouldBypass(pathWithoutQuery);
        if (shouldBypass)
        {
            _logger.LogInformation("✅ Bypassing license check for path: {Path}", pathWithoutQuery);
            await _next(context);
            return;
        }
        
        _logger.LogDebug("❌ License check required for path: {Path}", pathWithoutQuery);

        // Check if it's a static file (images, css, js, etc.)
        if (IsStaticFile(path))
        {
            await _next(context);
            return;
        }

        try
        {
            var isLicenseValid = await licenseService.IsLicenseValidAsync();

            // Check if it's an admin route
            if (IsAdminRoute(pathWithoutQuery))
            {
                if (!isLicenseValid)
                {
                    // For API calls, return 403
                    if (pathWithoutQuery.StartsWith("/api"))
                    {
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
                        {
                            success = false,
                            message = "License expired or invalid. Please contact administrator.",
                            requiresLicenseKey = true
                        }));
                        return;
                    }

                    // For web routes, redirect to license key entry (handled by frontend)
                    // We'll let the request pass and let frontend handle the redirect
                }
            }
            // Check if it's a public route (but not a bypassed route)
            else if (IsPublicRoute(pathWithoutQuery) && !ShouldBypass(pathWithoutQuery))
            {
                if (!isLicenseValid)
                {
                    // For API calls, return 503 (Service Unavailable)
                    if (pathWithoutQuery.StartsWith("/api"))
                    {
                        context.Response.StatusCode = 503;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
                        {
                            success = false,
                            message = "Service temporarily unavailable due to license expiration.",
                            maintenance = true
                        }));
                        return;
                    }

                    // For web routes, redirect to maintenance page (handled by frontend)
                    // We'll let the request pass and let frontend handle the redirect
                }
            }

            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in LicenseValidationMiddleware for path: {Path}", pathWithoutQuery);
            // On error, allow request to proceed (fail open)
            await _next(context);
        }
    }

    private bool ShouldBypass(string path)
    {
        // Normalize path to lowercase for comparison
        var normalizedPath = path.ToLower();
        
        // Check exact match or starts with (case insensitive)
        foreach (var bypass in BypassPaths)
        {
            var normalizedBypass = bypass.ToLower();
            if (normalizedPath.Equals(normalizedBypass) || normalizedPath.StartsWith(normalizedBypass))
            {
                _logger.LogInformation("✅ Bypass match: Path '{Path}' matches bypass pattern '{Bypass}'", normalizedPath, normalizedBypass);
                return true;
            }
        }
        
        _logger.LogInformation("❌ No bypass match: Path '{Path}' does not match any bypass pattern", normalizedPath);
        return false;
    }

    private static bool IsStaticFile(string path)
    {
        var staticExtensions = new[] { ".css", ".js", ".jpg", ".jpeg", ".png", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".pdf" };
        return staticExtensions.Any(ext => path.EndsWith(ext, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsAdminRoute(string path)
    {
        return AdminPaths.Any(adminPath => path.StartsWith(adminPath, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsPublicRoute(string path)
    {
        // If it's not an admin route and not an API auth route, consider it public
        return !IsAdminRoute(path) && 
               !path.StartsWith("/api/v1.0/auth", StringComparison.OrdinalIgnoreCase) &&
               !path.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase);
    }
}

