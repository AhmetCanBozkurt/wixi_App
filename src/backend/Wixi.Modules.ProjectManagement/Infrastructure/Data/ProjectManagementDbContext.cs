using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ProjectManagement.Infrastructure.Data;

public class ProjectManagementDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    /// <summary>
    /// Runtime (DI) constructor — per-tenant dynamic connection.
    /// TenantMiddleware tarafından doldurulan ITenantContext'i kullanır.
    /// </summary>
    public ProjectManagementDbContext(DbContextOptions<ProjectManagementDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    /// <summary>
    /// Design-time / provisioning constructor — sabit connection string.
    /// EF migrations ve ProjectManagementTenantProvisioner tarafından kullanılır.
    /// </summary>
    public ProjectManagementDbContext(DbContextOptions<ProjectManagementDbContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured && _tenantContext?.IsResolved == true)
        {
            optionsBuilder.UseSqlServer(_tenantContext.ConnectionString);
        }
    }

    public DbSet<WixiProject> Projects => Set<WixiProject>();
    public DbSet<WixiProjectMember> ProjectMembers => Set<WixiProjectMember>();
    public DbSet<WixiProjectTask> Tasks => Set<WixiProjectTask>();
    public DbSet<WixiTaskAssignee> TaskAssignees => Set<WixiTaskAssignee>();
    public DbSet<WixiTaskDependency> TaskDependencies => Set<WixiTaskDependency>();
    public DbSet<WixiTaskComment> TaskComments => Set<WixiTaskComment>();
    public DbSet<WixiTaskAttachment> TaskAttachments => Set<WixiTaskAttachment>();
    public DbSet<WixiTimeEntry> TimeEntries => Set<WixiTimeEntry>();

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditableEntries = ChangeTracker.Entries<IAuditable>();
        foreach (var entry in auditableEntries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedByUser ??= "System";
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── WixiProject ───────────────────────────────────────────
        modelBuilder.Entity<WixiProject>(entity =>
        {
            entity.ToTable("WIXI_PM_PROJECTS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(4000);
            entity.Property(e => e.CustomerName).HasMaxLength(300);
            entity.Property(e => e.Budget).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(10);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.Status);
        });

        // ── WixiProjectMember ─────────────────────────────────────
        modelBuilder.Entity<WixiProjectMember>(entity =>
        {
            entity.ToTable("WIXI_PM_PROJECT_MEMBERS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ProjectId, e.UserId }).IsUnique();
            entity.Property(e => e.UserName).HasMaxLength(300);
            entity.Property(e => e.UserEmail).HasMaxLength(320);
            entity.Property(e => e.Role).HasMaxLength(50);
            entity.HasOne(e => e.Project)
                .WithMany(p => p.Members)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiProjectTask ───────────────────────────────────────
        modelBuilder.Entity<WixiProjectTask>(entity =>
        {
            entity.ToTable("WIXI_PM_TASKS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(4000);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.Priority).HasConversion<int>();
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => new { e.ProjectId, e.Status, e.SortOrder });

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Alt görev self-FK — cascade döngüsü olmaması için Restrict
            entity.HasOne(e => e.ParentTask)
                .WithMany(p => p.SubTasks)
                .HasForeignKey(e => e.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── WixiTaskAssignee ──────────────────────────────────────
        modelBuilder.Entity<WixiTaskAssignee>(entity =>
        {
            entity.ToTable("WIXI_PM_TASK_ASSIGNEES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TaskId, e.UserId }).IsUnique();
            entity.Property(e => e.UserName).HasMaxLength(300);
            entity.Property(e => e.UserEmail).HasMaxLength(320);
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Assignees)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiTaskDependency ────────────────────────────────────
        modelBuilder.Entity<WixiTaskDependency>(entity =>
        {
            entity.ToTable("WIXI_PM_TASK_DEPENDENCIES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TaskId, e.DependsOnTaskId }).IsUnique();
            entity.Property(e => e.Type).HasConversion<int>();

            entity.HasOne(e => e.Task)
                .WithMany()
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.DependsOnTask)
                .WithMany()
                .HasForeignKey(e => e.DependsOnTaskId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── WixiTaskComment ───────────────────────────────────────
        modelBuilder.Entity<WixiTaskComment>(entity =>
        {
            entity.ToTable("WIXI_PM_TASK_COMMENTS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).HasMaxLength(4000).IsRequired();
            entity.Property(e => e.AuthorName).HasMaxLength(300);
            entity.HasIndex(e => e.TaskId);
            entity.HasOne(e => e.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiTaskAttachment ────────────────────────────────────
        modelBuilder.Entity<WixiTaskAttachment>(entity =>
        {
            entity.ToTable("WIXI_PM_TASK_ATTACHMENTS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(500).IsRequired();
            entity.Property(e => e.RelativePath).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.ContentType).HasMaxLength(200);
            entity.HasIndex(e => e.TaskId);
            entity.HasOne(e => e.Task)
                .WithMany()
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiTimeEntry ─────────────────────────────────────────
        modelBuilder.Entity<WixiTimeEntry>(entity =>
        {
            entity.ToTable("WIXI_PM_TIME_ENTRIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserName).HasMaxLength(300);
            entity.Property(e => e.Note).HasMaxLength(1000);
            entity.HasIndex(e => e.TaskId);
            entity.HasIndex(e => new { e.UserId, e.EndedAt });
            entity.HasOne(e => e.Task)
                .WithMany()
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
