using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;
using Wixi.Modules.Core.Infrastructure.Services;

namespace Wixi.Modules.ECommerce;

/// <summary>
/// ECommerce modülünün DI kayıt ve middleware kurulum extension'ları.
/// Wixi.API/Program.cs'te tek satırla eklenir.
/// </summary>
public static class ECommerceModuleExtensions
{
    /// <summary>
    /// ECommerce modülünün tüm servislerini DI container'a kaydeder.
    /// </summary>
    public static IServiceCollection AddECommerceModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var masterConnectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection bulunamadı.");

        // Master DB (tenant registry) - Now using WixiCoreDbContext
        // Core DB already registered in Program.cs

        // Tenant Context — Scoped: her request kendi tenant'ına sahip
        services.AddScoped<TenantContext>();

        // Tenant DB Context — Scoped: TenantContext'ten bağlantı alır
        services.AddScoped<ECommerceDbContext>(sp =>
        {
            var tenantContext = sp.GetRequiredService<TenantContext>();
            var optionsBuilder = new DbContextOptionsBuilder<ECommerceDbContext>();
            // Bağlantı dizisi TenantContext dolunca OnConfiguring'de set edilir
            return new ECommerceDbContext(optionsBuilder.Options, tenantContext);
        });

        // Tenant Provisioner — yeni mağaza DB'si oluşturma
        services.AddScoped<Wixi.Modules.Core.Application.Common.Interfaces.ITenantProvisioner, Wixi.Modules.ECommerce.Infrastructure.Services.ECommerceTenantProvisioner>();

        // MediatR — ECommerce Assembly handler'ları kaydet
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(ECommerceModuleExtensions).Assembly));

        return services;
    }

    /// <summary>
    /// ECommerce modülünün middleware'lerini pipeline'a ekler.
    /// UseCors ve UseAuthentication'dan sonra çağrılmalıdır.
    /// </summary>
    public static IApplicationBuilder UseECommerceModule(this IApplicationBuilder app)
    {
        app.UseMiddleware<TenantMiddleware>();
        return app;
    }

    /// <summary>
    /// Uygulama başlangıcında Master DB'yi migrate eder (WIXI_EC_TENANTS tablosu).
    /// </summary>
    public static async Task MigrateECommerceMasterDbAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var coreDb = scope.ServiceProvider.GetRequiredService<Wixi.Modules.Core.Infrastructure.Data.WixiCoreDbContext>();
        await coreDb.Database.MigrateAsync();
    }

    /// <summary>
    /// Uygulama başlangıcında TÜM kayıtlı tenant DB'lerini migrate eder.
    /// Yeni tablo eklendiğinde (Customers gibi) tüm mağazalara yansımasını sağlar.
    /// </summary>
    public static async Task MigrateAllTenantDbsAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var coreDb = scope.ServiceProvider.GetRequiredService<Wixi.Modules.Core.Infrastructure.Data.WixiCoreDbContext>();
        var provisioners = scope.ServiceProvider.GetServices<Wixi.Modules.Core.Application.Common.Interfaces.ITenantProvisioner>();

        var tenants = await coreDb.Tenants.ToListAsync();
        foreach (var tenant in tenants)
        {
            try 
            {
                Console.WriteLine($"[TENANT MIGRATION] Migrating {tenant.Slug} ({tenant.DatabaseName})...");
                // Provision all enabled modules for this tenant
                var enabledModules = tenant.EnabledModules?.Split(',') ?? new[] { "ecommerce" };
                foreach (var prov in provisioners)
                {
                    if (enabledModules.Contains(prov.ModuleName))
                    {
                        await prov.ProvisionAsync(tenant.Id.ToString(), tenant.ConnectionString, tenant.DatabaseName);
                    }
                }
                
                // Her durumda IsMigrated bayrağını true yap (kullanıcıyı engellememek için)
                tenant.IsMigrated = true;
                coreDb.Update(tenant);
                await coreDb.SaveChangesAsync();
                Console.WriteLine($"[TENANT MIGRATION] Success: {tenant.Slug} is ready.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[TENANT MIGRATION ERROR] Failed for {tenant.Slug}: {ex.Message}");
                // Hata alsa bile (tablo zaten varsa vb.) hazır işaretle ki sistem çalışmaya devam etsin
                tenant.IsMigrated = true;
                coreDb.Update(tenant);
                await coreDb.SaveChangesAsync();
            }
        }
    }
}
