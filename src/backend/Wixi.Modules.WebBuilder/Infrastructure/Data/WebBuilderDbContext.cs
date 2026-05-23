using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.WebBuilder.Infrastructure.Data;

public class WebBuilderDbContext : DbContext
{
    public WebBuilderDbContext(DbContextOptions<WebBuilderDbContext> options) : base(options)
    {
    }

    public DbSet<WixiCorpPage> CorpPages { get; set; }
    public DbSet<WixiCorpPageVersion> CorpPageVersions { get; set; }
    public DbSet<WixiBlogCategory> BlogCategories { get; set; }
    public DbSet<WixiBlogPost> BlogPosts { get; set; }
    public DbSet<WixiWebForm> WebForms { get; set; }
    public DbSet<WixiWebFormSubmission> WebFormSubmissions { get; set; }

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

        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Client Wins strategy: refresh original values and retry once
            foreach (var entry in ex.Entries)
            {
                var databaseValues = await entry.GetDatabaseValuesAsync(cancellationToken);
                if (databaseValues == null)
                {
                    entry.State = EntityState.Detached;
                }
                else
                {
                    entry.OriginalValues.SetValues(databaseValues);
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Global query filter: soft delete (IsDeleted = false) for all IAuditable entities
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(IAuditable).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
                var property = System.Linq.Expressions.Expression.Property(parameter, "IsDeleted");
                var falseConst = System.Linq.Expressions.Expression.Constant(false);
                var body = System.Linq.Expressions.Expression.Equal(property, falseConst);
                var lambda = System.Linq.Expressions.Expression.Lambda(body, parameter);
                builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

        builder.Entity<WixiCorpPage>(entity =>
        {
            entity.ToTable("WB_CORP_PAGES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.MetaTitle).HasMaxLength(200);
            entity.Property(e => e.MetaDescription).HasMaxLength(500);
            entity.Property(e => e.MetaKeywords).HasMaxLength(500);
            entity.Property(e => e.OpenGraphImageUrl).HasMaxLength(1000);
        });

        builder.Entity<WixiCorpPageVersion>(entity =>
        {
            entity.ToTable("WB_CORP_PAGE_VERSIONS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PageId);
            entity.Property(e => e.CheckpointLabel).HasMaxLength(200);
            entity.Property(e => e.CreatedByUser).HasMaxLength(256);
        });

        builder.Entity<WixiBlogCategory>(entity =>
        {
            entity.ToTable("WB_BLOG_CATEGORIES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        builder.Entity<WixiBlogPost>(entity =>
        {
            entity.ToTable("WB_BLOG_POSTS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();
            entity.HasIndex(e => e.TenantId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(300);
            entity.Property(e => e.FeaturedImageUrl).HasMaxLength(1000);
            entity.Property(e => e.MetaTitle).HasMaxLength(200);
            entity.Property(e => e.MetaDescription).HasMaxLength(500);
            entity.Property(e => e.Tags).HasMaxLength(1000);
            entity.Property(e => e.AuthorName).HasMaxLength(200);
        });

        builder.Entity<WixiWebForm>(entity =>
        {
            entity.ToTable("WB_WEB_FORMS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(300);
            entity.Property(e => e.SubmitButtonText).HasMaxLength(100);
            entity.Property(e => e.SuccessMessage).HasMaxLength(1000);
            entity.Property(e => e.NotifyEmail).HasMaxLength(256);
        });

        builder.Entity<WixiWebFormSubmission>(entity =>
        {
            entity.ToTable("WB_FORM_SUBMISSIONS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.FormId);
            entity.HasIndex(e => e.TenantId);
            entity.Property(e => e.IpAddress).HasMaxLength(64);
        });
    }
}
