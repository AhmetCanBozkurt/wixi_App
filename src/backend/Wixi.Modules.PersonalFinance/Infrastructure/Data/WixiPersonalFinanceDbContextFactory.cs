using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Wixi.Modules.PersonalFinance.Infrastructure.Data;

public class WixiPersonalFinanceDbContextFactory : IDesignTimeDbContextFactory<WixiPersonalFinanceDbContext>
{
    public WixiPersonalFinanceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WixiPersonalFinanceDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=78.188.86.124,1533;Database=Wixi_App;User Id=Wixi_App;Password=Wixi_App12.;TrustServerCertificate=True;");
        return new WixiPersonalFinanceDbContext(optionsBuilder.Options);
    }
}
