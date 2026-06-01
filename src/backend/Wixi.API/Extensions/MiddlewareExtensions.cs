namespace Wixi.API.Extensions;

public static class MiddlewareExtensions
{
    public static WebApplication UseWixiMiddleware(this WebApplication app)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
                if (error?.Error is FluentValidation.ValidationException validationEx)
                {
                    context.Response.StatusCode = 400;
                    context.Response.ContentType = "application/json";
                    var errors = validationEx.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
                    await context.Response.WriteAsJsonAsync(new { errors });
                }
                else
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/problem+json";
                    var problem = new Microsoft.AspNetCore.Mvc.ProblemDetails
                    {
                        Status = 500,
                        Title = "Sunucu hatası",
                        Detail = context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment()
                            ? error?.Error.ToString()
                            : "Beklenmeyen bir hata oluştu.",
                        Instance = context.Request.Path
                    };
                    await context.Response.WriteAsJsonAsync(problem);
                }
            });
        });

        app.UseStaticFiles();
        app.UseCors("AllowReactApp");
        app.UseRateLimiter();
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }
}
