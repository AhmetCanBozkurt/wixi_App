namespace wixi.WebAPI.Middleware;

public class RequestSizeLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestSizeLimitMiddleware> _logger;
    private readonly long _maxRequestBodySize;

    public RequestSizeLimitMiddleware(
        RequestDelegate next, 
        ILogger<RequestSizeLimitMiddleware> logger,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _maxRequestBodySize = configuration.GetValue<long>("RequestSizeLimit:MaxBytes", 10 * 1024 * 1024); // 10MB default
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.ContentLength.HasValue && 
            context.Request.ContentLength.Value > _maxRequestBodySize)
        {
            _logger.LogWarning("Request too large: {Size} bytes from {IP}", 
                context.Request.ContentLength.Value, 
                context.Connection.RemoteIpAddress);

            context.Response.StatusCode = 413; // Payload Too Large
            context.Response.ContentType = "application/json";
            
            var error = System.Text.Json.JsonSerializer.Serialize(new
            {
                message = "Request body too large",
                maxSize = _maxRequestBodySize,
                actualSize = context.Request.ContentLength.Value
            });
            
            await context.Response.WriteAsync(error);
            return;
        }

        await _next(context);
    }
}







