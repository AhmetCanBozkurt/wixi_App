using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder;

public static class WebBuilderModuleExtensions
{
    public static IServiceCollection AddWebBuilderModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<WebBuilderDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(WebBuilderModuleExtensions).Assembly));

        return services;
    }

    public static async Task MigrateWebBuilderDbAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WebBuilderDbContext>();
        await db.Database.MigrateAsync();
    }
}
