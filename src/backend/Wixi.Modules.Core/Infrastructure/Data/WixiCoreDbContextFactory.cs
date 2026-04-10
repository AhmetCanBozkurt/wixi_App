using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Wixi.Modules.Core.Infrastructure.Data;

public class WixiCoreDbContextFactory : IDesignTimeDbContextFactory<WixiCoreDbContext>
{
    public WixiCoreDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WixiCoreDbContext>();
        // Hardcoded specifically for Design-Time Migrations
        optionsBuilder.UseSqlServer("Server=78.188.86.124,1533;Database=wixi_App;User Id=wixi_App;Password=Abozkurt02.;TrustServerCertificate=True;");

        return new WixiCoreDbContext(optionsBuilder.Options);
    }
}
