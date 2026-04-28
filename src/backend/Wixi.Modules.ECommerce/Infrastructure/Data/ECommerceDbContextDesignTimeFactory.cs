using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.Modules.ECommerce.Infrastructure.Data;

/// <summary>
/// EF Core CLI araçları (dotnet ef migrations) için tasarım zamanı factory.
/// Gerçek çalışma zamanında kullanılmaz — sadece migration oluşturma için.
/// </summary>
public class ECommerceDbContextDesignTimeFactory : IDesignTimeDbContextFactory<ECommerceDbContext>
{
    // appsettings.json'dan alınmalı ama migration için placeholder yeterli
    private const string DesignTimeConnectionString =
        "Server=78.188.86.124,1533;Database=wixi_ec_designtime;User Id=wixi_App;Password=Abozkurt02.;TrustServerCertificate=True;";

    public ECommerceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ECommerceDbContext>();
        optionsBuilder.UseSqlServer(DesignTimeConnectionString);

        var tenantContext = new TenantContext();
        tenantContext.Set(Guid.Empty, DesignTimeConnectionString, "designtime");

        return new ECommerceDbContext(optionsBuilder.Options, tenantContext);
    }
}
