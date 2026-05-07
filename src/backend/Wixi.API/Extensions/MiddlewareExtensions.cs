namespace Wixi.API.Extensions;

public static class MiddlewareExtensions
{
    public static WebApplication UseWixiMiddleware(this WebApplication app)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/problem+json";
                var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
                if (error != null)
                {
                    var problem = new Microsoft.AspNetCore.Mvc.ProblemDetails
                    {
                        Status = 500,
                        Title = "Sunucu hatası",
                        Detail = context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment()
                            ? error.Error.ToString()
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
