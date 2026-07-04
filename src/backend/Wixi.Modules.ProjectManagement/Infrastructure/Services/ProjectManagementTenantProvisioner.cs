using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Infrastructure.Services;

/// <summary>
/// Proje Yönetimi modülü tenant provisioner'ı.
/// OnboardingPage'deki modül id'si ile aynı: "tasks".
/// Tenant'ın kendi DB'sine PM tablolarını kurar ve örnek proje seed'ler.
/// </summary>
public class ProjectManagementTenantProvisioner : ITenantProvisioner
{
    public string ModuleName => "tasks";

    public async Task ProvisionAsync(
        string tenantId,
        string connectionString,
        string databaseName,
        CancellationToken cancellationToken = default)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        await using var db = new ProjectManagementDbContext(optionsBuilder.Options);

        // DB oluştur + PM migration'larını uygula (idempotent)
        await db.Database.MigrateAsync(cancellationToken);

        // Örnek proje seed (idempotent)
        if (await db.Projects.AnyAsync(cancellationToken))
            return;

        var project = new WixiProject
        {
            Code = "PRJ-00001",
            Name = "Hoş Geldiniz Projesi",
            Description = "Proje yönetimi modülünü tanımak için örnek proje. Silebilirsiniz.",
            Status = ProjectStatus.Active,
            Color = "#6366f1",
            CreatedByUser = "System",
            Tasks =
            [
                new WixiProjectTask { Title = "Panoya göz atın", Status = ProjectTaskStatus.Todo, Priority = ProjectTaskPriority.Low, SortOrder = 0, CreatedByUser = "System" },
                new WixiProjectTask { Title = "İlk görevinizi oluşturun", Status = ProjectTaskStatus.Todo, Priority = ProjectTaskPriority.Medium, SortOrder = 1, CreatedByUser = "System" },
                new WixiProjectTask { Title = "Görevi sürükleyip durum değiştirin", Status = ProjectTaskStatus.InProgress, Priority = ProjectTaskPriority.High, Progress = 50, SortOrder = 0, CreatedByUser = "System" },
            ]
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync(cancellationToken);
    }
}
