using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Wixi.Modules.WebBuilder.Infrastructure.Data;

public class WebBuilderDbContextFactory : IDesignTimeDbContextFactory<WebBuilderDbContext>
{
    public WebBuilderDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WebBuilderDbContext>();
        // Design-time factory — must match the runtime DefaultConnection in appsettings.json
        optionsBuilder.UseSqlServer("Server=78.188.86.124,1533;Database=Wixi_App;User Id=Wixi_App;Password=Wixi_App12.;TrustServerCertificate=True;");

        return new WebBuilderDbContext(optionsBuilder.Options);
    }
}
