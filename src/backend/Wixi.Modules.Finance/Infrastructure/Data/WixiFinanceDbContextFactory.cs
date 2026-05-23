using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Wixi.Modules.Finance.Infrastructure.Data;

public class WixiFinanceDbContextFactory : IDesignTimeDbContextFactory<WixiFinanceDbContext>
{
    public WixiFinanceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WixiFinanceDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=78.188.86.124,1533;Database=Wixi_App;User Id=Wixi_App;Password=Wixi_App12.;TrustServerCertificate=True;");
        return new WixiFinanceDbContext(optionsBuilder.Options);
    }
}
