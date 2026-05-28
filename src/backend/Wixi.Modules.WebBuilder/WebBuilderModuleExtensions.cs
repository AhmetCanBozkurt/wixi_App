using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.WebBuilder.Infrastructure.Data;
using Wixi.Modules.WebBuilder.Infrastructure.Services;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.WebBuilder;

public static class WebBuilderModuleExtensions
{
    public static IServiceCollection AddWebBuilderModule(this IServiceCollection services, IConfiguration configuration)
    {
        // WebBuilderDbContext — per-tenant dynamic connection.
        // ITenantContext ECommerce modülü tarafından Scoped olarak kayıtlıdır;
        // her request kendi tenant'ının connection string'ini taşır.
        // Provisioning ve design-time için parametresiz constructor da var.
        services.AddScoped<WebBuilderDbContext>(sp =>
        {
            var tenantContext = sp.GetRequiredService<ITenantContext>();
            var optionsBuilder = new DbContextOptionsBuilder<WebBuilderDbContext>();
            // Connection string set edilmiyor — OnConfiguring TenantContext'ten alacak.
            return new WebBuilderDbContext(optionsBuilder.Options, tenantContext);
        });

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(WebBuilderModuleExtensions).Assembly));

        services.AddScoped<ITenantProvisioner, WebBuilderTenantProvisioner>();

        return services;
    }

    /// <summary>
    /// Platform (shared) WebBuilder DB'yi migrate eder.
    /// ÖNEMLİ: Bu artık PLATFORM tabloları için kullanılmıyor.
    /// Tenant bazlı WB tabloları MigrateAllTenantDbsAsync üzerinden uygulanır.
    /// </summary>
    public static async Task MigrateWebBuilderDbAsync(this IApplicationBuilder app)
    {
        // WebBuilderDbContext artık per-tenant dynamic context — platform migration'ı yok.
        // Bu metod geriye uyumluluk için boş bırakıldı.
        await Task.CompletedTask;
    }
}
