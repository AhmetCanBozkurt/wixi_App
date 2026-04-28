using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.Modules.ECommerce.Infrastructure.Services;

public class ECommerceTenantProvisioner : ITenantProvisioner
{
    public string ModuleName => "ecommerce";

    public async Task ProvisionAsync(string tenantId, string connectionString, string databaseName, CancellationToken cancellationToken = default)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ECommerceDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        // We need a dummy tenant context for ECommerceDbContext constructor
        var dummyContext = new TenantContext();
        dummyContext.Set(Guid.Parse(tenantId), connectionString, databaseName);

        await using var dbContext = new ECommerceDbContext(optionsBuilder.Options, dummyContext);
        
        // This will create the DB if it doesn't exist and run all ECommerce migrations
        await dbContext.Database.MigrateAsync(cancellationToken);
    }
}
