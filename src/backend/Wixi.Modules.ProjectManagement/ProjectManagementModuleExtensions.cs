using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;
using Wixi.Modules.ProjectManagement.Infrastructure.Services;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ProjectManagement;

public static class ProjectManagementModuleExtensions
{
    public static IServiceCollection AddProjectManagementModule(this IServiceCollection services, IConfiguration configuration)
    {
        // ProjectManagementDbContext — per-tenant dynamic connection.
        // ITenantContext ECommerce modülü tarafından Scoped olarak kayıtlıdır;
        // her request kendi tenant'ının connection string'ini taşır.
        services.AddScoped<ProjectManagementDbContext>(sp =>
        {
            var tenantContext = sp.GetRequiredService<ITenantContext>();
            var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementDbContext>();
            // Connection string set edilmiyor — OnConfiguring TenantContext'ten alacak.
            return new ProjectManagementDbContext(optionsBuilder.Options, tenantContext);
        });

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(ProjectManagementModuleExtensions).Assembly));

        services.AddScoped<ITenantProvisioner, ProjectManagementTenantProvisioner>();

        return services;
    }
}
