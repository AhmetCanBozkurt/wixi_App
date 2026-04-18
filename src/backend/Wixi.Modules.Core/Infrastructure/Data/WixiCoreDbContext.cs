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
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedByUser = _currentUserService?.FullName ?? "System";
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedByUser = _currentUserService?.FullName ?? "System";
            }
        }

        // 2. Prepare Detailed Audit Logs
        var auditEntries = new List<WixiAuditLog>();
        try
        {
            var changedEntries = ChangeTracker.Entries()
                .Where(x => x.State == EntityState.Added || x.State == EntityState.Modified || x.State == EntityState.Deleted)
                .ToList();

            foreach (var entry in changedEntries)
            {
                if (entry.Entity is WixiAuditLog) continue;

                var tableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name;
                var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey())?.CurrentValue?.ToString() ?? "N/A";
                
                var oldValues = new Dictionary<string, object?>();
                var newValues = new Dictionary<string, object?>();
                var affectedColumns = new List<string>();
                string action = entry.State.ToString().ToUpper();
                LogType logType = LogType.DataAudit;

                // Blacklist of columns to never log
                var blacklist = new List<string> { "CreatedAt", "CreatedByUser", "UpdatedAt", "UpdatedByUser", "CreatedBy", "UpdatedBy" };

                if (entry.State == EntityState.Modified)
                {
                    // Check for Soft Delete
                    var isDeletedProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "IsDeleted");
                    if (isDeletedProp != null && 
                        (bool?)isDeletedProp.OriginalValue == false && 
                        (bool?)isDeletedProp.CurrentValue == true)
                    {
                        action = "SOFT_DELETE";
                    }

                    foreach (var property in entry.Properties)
                    {
                        if (property.IsModified && !blacklist.Contains(property.Metadata.Name))
                        {
                            affectedColumns.Add(property.Metadata.Name);
                            oldValues[property.Metadata.Name] = property.OriginalValue;
                            newValues[property.Metadata.Name] = property.CurrentValue;
                        }
                    }
                }
                else if (entry.State == EntityState.Added)
                {
                    foreach (var property in entry.Properties)
                    {
                        if (!blacklist.Contains(property.Metadata.Name))
                        {
                            newValues[property.Metadata.Name] = property.CurrentValue;
                        }
                    }
                }
                else if (entry.State == EntityState.Deleted)
                {
                    foreach (var property in entry.Properties)
                    {
                        if (!blacklist.Contains(property.Metadata.Name))
                        {
                            oldValues[property.Metadata.Name] = property.OriginalValue;
                        }
                    }
                }

                if (oldValues.Count == 0 && newValues.Count == 0 && action == "UPDATE") continue;

                auditEntries.Add(new WixiAuditLog
                {
                    LogType = logType,
                    Action = action,
                    TableName = tableName,
                    EntityId = primaryKey,
                    OldValues = oldValues.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(oldValues) : null,
                    NewValues = newValues.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(newValues) : null,
                    AffectedColumns = affectedColumns.Count > 0 ? string.Join(", ", affectedColumns) : null,
                    Details = $"{action} operation on {tableName} ({primaryKey})",
                    UserId = _currentUserService?.UserId,
                    Email = _currentUserService?.Email,
                    FullName = _currentUserService?.FullName,
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
            // Logging internally to console for debug, but ensuring SaveChanges continues
            Console.WriteLine($"Detailed Audit logging preparation failed: {ex.Message}");
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

    public async Task LogActivityAsync(string action, string? tableName = null, string? entityId = null, string? details = null, LogType logType = LogType.Activity)
    {
        var auditLog = new WixiAuditLog
        {
            LogType = logType,
            Action = action,
            TableName = tableName,
            EntityId = entityId,
            Details = details,
            UserId = _currentUserService?.UserId,
            Email = _currentUserService?.Email,
            FullName = _currentUserService?.FullName,
            IpAddress = _currentUserService?.IpAddress,
            UserAgent = _currentUserService?.UserAgent,
            CreatedAt = DateTime.UtcNow
        };

        await AuditLogs.AddAsync(auditLog);
        await base.SaveChangesAsync();
    }
}
