using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Wixi.Modules.ProjectManagement.Infrastructure.Data;

public class ProjectManagementDbContextFactory : IDesignTimeDbContextFactory<ProjectManagementDbContext>
{
    public ProjectManagementDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementDbContext>();
        // Design-time factory — must match the runtime DefaultConnection in appsettings.json
        optionsBuilder.UseSqlServer("Server=78.188.86.124,1533;Database=Wixi_App;User Id=Wixi_App;Password=Wixi_App12.;TrustServerCertificate=True;");

        return new ProjectManagementDbContext(optionsBuilder.Options);
    }
}
