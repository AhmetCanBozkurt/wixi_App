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
    public DbSet<WixiMailTemplate> MailTemplates { get; set; }
    public DbSet<WixiMailLog> MailLogs { get; set; }
    public DbSet<WixiSmtpSetting> SmtpSettings { get; set; }
    public DbSet<WixiFile> Files { get; set; }
    public DbSet<WixiTwoFactorCode> TwoFactorCodes { get; set; }
    public DbSet<WixiRefreshToken> RefreshTokens { get; set; }
    public DbSet<WixiTenant> Tenants { get; set; }

    // Subscription & Billing
    public DbSet<WixiSubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<WixiTenantSubscription> TenantSubscriptions { get; set; }
    public DbSet<WixiPaymentTransaction> PaymentTransactions { get; set; }

    // Currency Management
    public DbSet<WixiCurrency> Currencies { get; set; }
    public DbSet<WixiExchangeRate> ExchangeRates { get; set; }
    public DbSet<WixiCurrencySetting> CurrencySettings => Set<WixiCurrencySetting>();
    public DbSet<WixiModule> Modules => Set<WixiModule>();
    public DbSet<WixiModuleMenu> ModuleMenus => Set<WixiModuleMenu>();
    public DbSet<WixiModuleMenuTranslation> ModuleMenuTranslations => Set<WixiModuleMenuTranslation>();
    public DbSet<WixiThemeTemplate> ThemeTemplates => Set<WixiThemeTemplate>();
    public DbSet<WixiDbSchemaLayout> DbSchemaLayouts => Set<WixiDbSchemaLayout>();

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

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(Wixi.Shared.Domain.Entities.IAuditable).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
                var property = System.Linq.Expressions.Expression.Property(parameter, "IsDeleted");
                var falseConst = System.Linq.Expressions.Expression.Constant(false);
                var body = System.Linq.Expressions.Expression.Equal(property, falseConst);
                var lambda = System.Linq.Expressions.Expression.Lambda(body, parameter);
                builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

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

        // Modules Mapping
        builder.Entity<WixiModule>(entity =>
        {
            entity.ToTable("WIXI_MODULES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.IsPublic).HasDefaultValue(true);
            entity.Property(e => e.PriceMonthly).HasColumnType("decimal(10,2)");
            entity.Property(e => e.PriceYearly).HasColumnType("decimal(10,2)");
            entity.Property(e => e.FeaturesJson).HasMaxLength(2000);
            entity.Property(e => e.ColorAccent).HasMaxLength(50);
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

        // Module Menus Mapping (Templates)
        builder.Entity<WixiModuleMenu>(entity =>
        {
            entity.ToTable("WIXI_MODULE_MENUS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Path).HasMaxLength(255);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.IconColor).HasMaxLength(50);

            entity.HasOne(e => e.Module)
                  .WithMany()
                  .HasForeignKey(e => e.ModuleId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Parent)
                  .WithMany(e => e.Children)
                  .HasForeignKey(e => e.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Module Menu Translations
        builder.Entity<WixiModuleMenuTranslation>(entity =>
        {
            entity.ToTable("WIXI_MODULE_MENU_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.ModuleMenu)
                  .WithMany(m => m.Translations)
                  .HasForeignKey(e => e.ModuleMenuId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Cascade);
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

        // Mail Templates Mapping
        builder.Entity<WixiMailTemplate>(entity =>
        {
            entity.ToTable("WIXI_MAIL_TEMPLATES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Category).HasMaxLength(100);
        });

        // Mail Logs Mapping
        builder.Entity<WixiMailLog>(entity =>
        {
            entity.ToTable("WIXI_MAIL_LOGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Recipient).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Subject).HasMaxLength(500);
            entity.Property(e => e.TemplateCode).HasMaxLength(100);
        });

        // SMTP Settings Mapping
        builder.Entity<WixiSmtpSetting>(entity =>
        {
            entity.ToTable("WIXI_SMTP_SETTINGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Server).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Username).HasMaxLength(255);
            entity.Property(e => e.SenderName).HasMaxLength(255);
            entity.Property(e => e.SenderEmail).IsRequired().HasMaxLength(255);
        });
        
        builder.Entity<WixiFile>().ToTable("WIXI_FILES");

        // 2FA Codes Mapping
        builder.Entity<WixiTwoFactorCode>(entity =>
        {
            entity.ToTable("WIXI_2FA_CODES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CodeHash).IsRequired().HasMaxLength(128);
            entity.Property(e => e.CodeSalt).IsRequired().HasMaxLength(64);
            entity.Property(e => e.SessionToken).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.SessionToken).IsUnique();
        });

        // Refresh Tokens Mapping
        builder.Entity<WixiRefreshToken>(entity =>
        {
            entity.ToTable("WIXI_REFRESH_TOKENS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Token).IsUnique();
        });

        // Tenants Mapping
        builder.Entity<WixiTenant>(entity =>
        {
            entity.ToTable("WIXI_TENANTS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DatabaseName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.ConnectionString).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.OwnerEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.EnabledModules).HasMaxLength(500);
            entity.Property(e => e.ThemeColorPrimary).HasMaxLength(20);
            entity.Property(e => e.CustomDomain).HasMaxLength(255);
            entity.Property(e => e.SeoTitle).HasMaxLength(200);
            entity.Property(e => e.SeoDescription).HasMaxLength(500);
            entity.Property(e => e.LastMigrationError).HasMaxLength(2000);
        });

        // Subscription Plans Mapping
        builder.Entity<WixiSubscriptionPlan>(entity =>
        {
            entity.ToTable("WIXI_SUBSCRIPTION_PLANS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PriceMonthly).HasColumnType("decimal(10,2)");
            entity.Property(e => e.PriceYearly).HasColumnType("decimal(10,2)");
            entity.Property(e => e.StripePriceIdMonthly).HasMaxLength(100);
            entity.Property(e => e.StripePriceIdYearly).HasMaxLength(100);
        });

        // Tenant Subscriptions Mapping
        builder.Entity<WixiTenantSubscription>(entity =>
        {
            entity.ToTable("WIXI_TENANT_SUBSCRIPTIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);
            entity.Property(e => e.BillingInterval).IsRequired().HasMaxLength(20);
            entity.Property(e => e.StripeCustomerId).HasMaxLength(100);
            entity.Property(e => e.StripeSubscriptionId).HasMaxLength(100);
            entity.Property(e => e.PaymentMethod).HasMaxLength(30);

            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Plan)
                  .WithMany()
                  .HasForeignKey(e => e.PlanId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment Transactions Mapping
        builder.Entity<WixiPaymentTransaction>(entity =>
        {
            entity.ToTable("WIXI_PAYMENT_TRANSACTIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(14,2)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(30);
            entity.Property(e => e.Gateway).IsRequired().HasMaxLength(30);
            entity.Property(e => e.ExternalId).HasMaxLength(200);
            entity.Property(e => e.ExternalSubscriptionId).HasMaxLength(200);
            entity.Property(e => e.FailureReason).HasMaxLength(500);

            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Currencies Mapping
        builder.Entity<WixiCurrency>(entity =>
        {
            entity.ToTable("WIXI_CURRENCIES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Symbol).HasMaxLength(10);
        });

        // Exchange Rates Mapping
        builder.Entity<WixiExchangeRate>(entity =>
        {
            entity.ToTable("WIXI_EXCHANGE_RATES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.RateDate, e.CurrencyId }).IsUnique();
            entity.Property(e => e.CurrencyCode).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Source).HasMaxLength(20);
            entity.Property(e => e.ForexBuying).HasColumnType("decimal(18,6)");
            entity.Property(e => e.ForexSelling).HasColumnType("decimal(18,6)");
            entity.Property(e => e.BanknoteBuying).HasColumnType("decimal(18,6)");
            entity.Property(e => e.BanknoteSelling).HasColumnType("decimal(18,6)");

            entity.HasOne(e => e.Currency)
                  .WithMany(c => c.ExchangeRates)
                  .HasForeignKey(e => e.CurrencyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Currency Settings Mapping
        builder.Entity<WixiCurrencySetting>(entity =>
        {
            entity.ToTable("WIXI_CURRENCY_SETTINGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BaseCurrencyCode).IsRequired().HasMaxLength(10);
            entity.Property(e => e.LastSyncStatus).HasMaxLength(500);
        });

        // Theme Templates Mapping
        builder.Entity<WixiThemeTemplate>(entity =>
        {
            entity.ToTable("WIXI_THEME_TEMPLATES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.PreviewImageUrl).HasMaxLength(1000);
        });

        // DB Schema Layouts Mapping
        builder.Entity<WixiDbSchemaLayout>(entity =>
        {
            entity.ToTable("WIXI_DB_SCHEMA_LAYOUTS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LayoutJson).IsRequired();
            entity.HasIndex(e => e.UserId).IsUnique();
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

    /// <summary>Anonymous veya JWT’li güvenlik olayları için (IP/UserAgent açıkça verilebilir).</summary>
    public async Task LogSecurityEventAsync(
        string action,
        string details,
        string? userId = null,
        string? email = null,
        string? fullName = null,
        string? ipAddress = null,
        string? userAgent = null,
        CancellationToken cancellationToken = default)
    {
        var auditLog = new WixiAuditLog
        {
            LogType = LogType.Security,
            Action = action,
            Details = details,
            UserId = userId ?? _currentUserService?.UserId,
            Email = email ?? _currentUserService?.Email,
            FullName = fullName ?? _currentUserService?.FullName,
            IpAddress = ipAddress ?? _currentUserService?.IpAddress,
            UserAgent = userAgent ?? _currentUserService?.UserAgent,
            CreatedAt = DateTime.UtcNow
        };

        await AuditLogs.AddAsync(auditLog, cancellationToken);
        await base.SaveChangesAsync(cancellationToken);
    }
}
