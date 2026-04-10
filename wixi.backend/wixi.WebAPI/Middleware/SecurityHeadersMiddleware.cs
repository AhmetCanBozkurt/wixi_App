using Microsoft.Extensions.Hosting;

namespace wixi.WebAPI.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;

    public SecurityHeadersMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Remove server header
        context.Response.Headers.Remove("Server");
        context.Response.Headers.Remove("X-Powered-By");

        // Add security headers
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        
        // HSTS (Strict-Transport-Security) - only in production
        if (context.Request.IsHttps && !_env.IsDevelopment())
        {
            context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        }

        // Content Security Policy (CSP) - relaxed in development for CORS
        if (_env.IsDevelopment())
        {
            context.Response.Headers.Append("Content-Security-Policy", 
                "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://localhost:*; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://localhost:*; " +
                "style-src 'self' 'unsafe-inline' http://localhost:* https://localhost:*; " +
                "img-src 'self' data: https: http:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*; " +
                "frame-ancestors 'self' http://localhost:* https://localhost:*");
        }
        else
        {
            context.Response.Headers.Append("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self'; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none'");
        }

        await _next(context);
    }
}

