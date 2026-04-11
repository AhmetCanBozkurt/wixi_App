using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Infrastructure.Data;

public class WixiCoreDbContext : IdentityDbContext<WixiUser, WixiRole, Guid>
{
    private readonly ICurrentUserService? _currentUserService;

    public WixiCoreDbContext(
        DbContextOptions<WixiCoreDbContext> options,
        ICurrentUserService? currentUserService = null) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<WixiAuditLog> AuditLogs { get; set; }
    public DbSet<WixiLanguage> Languages { get; set; }
    public DbSet<WixiMenu> Menus { get; set; }
    public DbSet<WixiMenuTranslation> MenuTranslations { get; set; }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Handle IAuditable timestamps
        var auditableEntries = ChangeTracker.Entries<IAuditable>();
        foreach (var entry in auditableEntries)
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = DateTime.UtcNow;
            else if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        // 2. Prepare Audit Logs (Safe Extraction)
        var auditEntries = new List<WixiAuditLog>();
        try
        {
            var changedEntries = ChangeTracker.Entries()
                .Where(x => x.State == EntityState.Added || x.State == EntityState.Modified || x.State == EntityState.Deleted)
                .ToList();

            foreach (var entry in changedEntries)
            {
                if (entry.Entity is WixiAuditLog) continue;

                string entityId = "N/A";
                var idProp = entry.Metadata.FindProperty("Id");
                
                if (idProp != null)
                {
                    if (entry.State == EntityState.Deleted)
                    {
                        entityId = entry.Property("Id").OriginalValue?.ToString() ?? "N/A";
                    }
                    else
                    {
                        entityId = entry.Property("Id").CurrentValue?.ToString() ?? "N/A";
                    }
                }

                auditEntries.Add(new WixiAuditLog
                {
                    Action = $"{entry.State.ToString().ToUpper()}_{entry.Metadata.ClrType.Name.ToUpper()}",
                    Details = $"EntityId: {entityId}",
                    UserId = _currentUserService?.UserId,
                    Email = _currentUserService?.Email,
                    IpAddress = _currentUserService?.IpAddress,
                    UserAgent = _currentUserService?.UserAgent,
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (auditEntries.Any())
            {
                await AuditLogs.AddRangeAsync(auditEntries, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Audit logging preparation failed: {ex.Message}");
        }

        // 3. Robust Save with Concurrency Handling
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Simple 'Client Wins' strategy: refresh entities from database and retry once
            foreach (var entry in ex.Entries)
            {
                var databaseValues = await entry.GetDatabaseValuesAsync(cancellationToken);
                if (databaseValues == null)
                {
                    // Entity was deleted by someone else, so we detach it
                    entry.State = EntityState.Detached;
                }
                else
                {
                    // Update original values to current database values and try again
                    entry.OriginalValues.SetValues(databaseValues);
                }
            }
            
            return await base.SaveChangesAsync(cancellationToken);
        }
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // ... (rest of the mapping code kept as is)

        // Naming standard applied for Modular Enterprise App
        builder.Entity<WixiUser>(b =>
        {
            b.ToTable("WIXI_USERS");
        });

        builder.Entity<WixiRole>(b =>
        {
            b.ToTable("WIXI_ROLES");
        });

        builder.Entity<IdentityUserRole<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_ROLES");
        });

        builder.Entity<IdentityUserClaim<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_CLAIMS");
        });

        builder.Entity<IdentityUserLogin<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_LOGINS");
        });

        builder.Entity<IdentityRoleClaim<Guid>>(b =>
        {
            b.ToTable("WIXI_ROLE_CLAIMS");
        });

        builder.Entity<IdentityUserToken<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_TOKENS");
        });

        // Audit Logs Mapping
        builder.Entity<WixiAuditLog>(entity =>
        {
            entity.ToTable("WIXI_AUDIT_LOGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
        });

        // Languages Mapping
        builder.Entity<WixiLanguage>(entity =>
        {
            entity.ToTable("WIXI_LANGUAGES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // Menus Mapping
        builder.Entity<WixiMenu>(entity =>
        {
            entity.ToTable("WIXI_MENUS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Path).HasMaxLength(255);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.IconColor).HasMaxLength(50);

            // User Isolated Menus
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Hierarchical Relationship
            entity.HasOne(e => e.Parent)
                  .WithMany(e => e.Children)
                  .HasForeignKey(e => e.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Menu Translations Mapping
        builder.Entity<WixiMenuTranslation>(entity =>
        {
            entity.ToTable("WIXI_MENU_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.Menu)
                  .WithMany(e => e.Translations)
                  .HasForeignKey(e => e.MenuId);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId);
        });

    }
}
