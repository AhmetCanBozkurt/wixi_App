using System.Net;
using System.Text.Json;
using wixi.Core.Exceptions;
using wixi.Core.Models;

namespace wixi.WebAPI.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex, _logger);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, ILogger<ExceptionHandlingMiddleware> logger)
    {
        // Don't modify response if it has already started
        if (context.Response.HasStarted)
        {
            logger.LogWarning("Response has already started, cannot add CORS headers for exception: {ExceptionType}", exception.GetType().Name);
            return;
        }

        // CRITICAL: Set CORS headers FIRST, before any other response manipulation
        // This must happen before setting status code or content type
        var origin = context.Request.Headers["Origin"].ToString();
        var allowedOrigins = new[] { 
            "http://localhost:3000", 
            "http://localhost:5173", 
            "http://localhost:5002", 
            "https://localhost:5002",
            "https://worklines.wixisoftware.com",
            "https://worklines.com.tr",
            "https://www.worklines.com.tr",
            "https://worklines.de",
            "https://www.worklines.de",
            "https://test.worklines.com.tr",
            "https://www.test.worklines.com.tr"
        };
        
        if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
        {
            // Force clear any existing response and set CORS headers
            try
            {
                // Remove any existing CORS headers to avoid duplicates
                context.Response.Headers.Remove("Access-Control-Allow-Origin");
                context.Response.Headers.Remove("Access-Control-Allow-Credentials");
                context.Response.Headers.Remove("Access-Control-Allow-Methods");
                context.Response.Headers.Remove("Access-Control-Allow-Headers");
                
                // Set CORS headers
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH";
                context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
                
                logger.LogDebug("CORS headers set for exception response: {Origin}", origin);
            }
            catch (InvalidOperationException ex)
            {
                // Headers already written, cannot modify
                logger.LogWarning(ex, "Cannot set CORS headers, response headers may have already been written");
            }
        }

        // Now set content type and status code
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            // Specific exceptions first (inherit from BusinessException)
            ValidationException validationEx => new ErrorResponse
            {
                Message = validationEx.Message,
                ErrorCode = validationEx.ErrorCode,
                StatusCode = validationEx.StatusCode,
                Errors = validationEx.Errors
            },
            NotFoundException notFoundEx => new ErrorResponse
            {
                Message = notFoundEx.Message,
                ErrorCode = notFoundEx.ErrorCode,
                StatusCode = notFoundEx.StatusCode
            },
            UnauthorizedException unauthorizedEx => new ErrorResponse
            {
                Message = unauthorizedEx.Message,
                ErrorCode = unauthorizedEx.ErrorCode,
                StatusCode = unauthorizedEx.StatusCode
            },
            ForbiddenException forbiddenEx => new ErrorResponse
            {
                Message = forbiddenEx.Message,
                ErrorCode = forbiddenEx.ErrorCode,
                StatusCode = forbiddenEx.StatusCode
            },
            // Base exception
            BusinessException businessEx => new ErrorResponse
            {
                Message = businessEx.Message,
                ErrorCode = businessEx.ErrorCode,
                StatusCode = businessEx.StatusCode
            },
            _ => new ErrorResponse
            {
                Message = "An internal server error occurred",
                ErrorCode = "INTERNAL_SERVER_ERROR",
                StatusCode = 500
            }
        };

        context.Response.StatusCode = response.StatusCode;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}

