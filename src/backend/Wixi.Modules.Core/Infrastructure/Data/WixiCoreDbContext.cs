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

    // Payment Gateway Settings (platform-wide, master DB)
    public DbSet<WixiPlatformPaymentSetting> PlatformPaymentSettings { get; set; }

    // Currency Management
    public DbSet<WixiCurrency> Currencies { get; set; }
    public DbSet<WixiExchangeRate> ExchangeRates { get; set; }
    public DbSet<WixiCurrencySetting> CurrencySettings => Set<WixiCurrencySetting>();
    public DbSet<WixiModule> Modules => Set<WixiModule>();
    public DbSet<WixiModuleMenu> ModuleMenus => Set<WixiModuleMenu>();
    public DbSet<WixiModuleMenuTranslation> ModuleMenuTranslations => Set<WixiModuleMenuTranslation>();
    public DbSet<WixiThemeTemplate> ThemeTemplates => Set<WixiThemeTemplate>();
    public DbSet<WixiDbSchemaLayout> DbSchemaLayouts => Set<WixiDbSchemaLayout>();

    // Reference Data — Phase C1
    public DbSet<WixiSystemPage> SystemPages { get; set; }
    public DbSet<WixiRegion> Regions { get; set; }
    public DbSet<WixiPort> Ports { get; set; }
    public DbSet<WixiPaymentTerm> PaymentTerms { get; set; }
    public DbSet<WixiTaxOffice> TaxOffices { get; set; }
    public DbSet<WixiIncoterm> Incoterms { get; set; }
    public DbSet<WixiTransportMode> TransportModes { get; set; }
    public DbSet<WixiPackageType> PackageTypes { get; set; }

    // Reference Data — Geography (Country / State / City)
    public DbSet<WixiCountry> Countries { get; set; }
    public DbSet<WixiState> States { get; set; }
    public DbSet<WixiCity> Cities { get; set; }

    // Landing Content
    public DbSet<WixiFaqCategory> FaqCategories => Set<WixiFaqCategory>();
    public DbSet<WixiFaqCategoryTranslation> FaqCategoryTranslations => Set<WixiFaqCategoryTranslation>();
    public DbSet<WixiFaq> Faqs => Set<WixiFaq>();
    public DbSet<WixiFaqTranslation> FaqTranslations => Set<WixiFaqTranslation>();
    public DbSet<WixiContactSubmission> ContactSubmissions => Set<WixiContactSubmission>();
    public DbSet<WixiPlatformStat> PlatformStats => Set<WixiPlatformStat>();
    public DbSet<WixiPlatformStatTranslation> PlatformStatTranslations => Set<WixiPlatformStatTranslation>();

    // Landing Content — Wave 3
    public DbSet<WixiLegalDocument> LegalDocuments => Set<WixiLegalDocument>();
    public DbSet<WixiLegalDocumentTranslation> LegalDocumentTranslations => Set<WixiLegalDocumentTranslation>();

    // Landing Content — Wave 2
    public DbSet<WixiTeamMember> TeamMembers => Set<WixiTeamMember>();
    public DbSet<WixiTeamMemberTranslation> TeamMemberTranslations => Set<WixiTeamMemberTranslation>();
    public DbSet<WixiCompanyMilestone> CompanyMilestones => Set<WixiCompanyMilestone>();
    public DbSet<WixiCompanyMilestoneTranslation> CompanyMilestoneTranslations => Set<WixiCompanyMilestoneTranslation>();
    public DbSet<WixiCaseStudy> CaseStudies => Set<WixiCaseStudy>();
    public DbSet<WixiCaseStudyTranslation> CaseStudyTranslations => Set<WixiCaseStudyTranslation>();
    public DbSet<WixiRoadmapItem> RoadmapItems => Set<WixiRoadmapItem>();
    public DbSet<WixiRoadmapItemTranslation> RoadmapItemTranslations => Set<WixiRoadmapItemTranslation>();
    public DbSet<WixiRoadmapVote> RoadmapVotes => Set<WixiRoadmapVote>();
    public DbSet<WixiChangelogEntry> ChangelogEntries => Set<WixiChangelogEntry>();
    public DbSet<WixiChangelogTranslation> ChangelogTranslations => Set<WixiChangelogTranslation>();

    // Reference Data — Phase C2
    public DbSet<WixiUnitCategory> UnitCategories { get; set; }
    public DbSet<WixiUnit> Units { get; set; }
    public DbSet<WixiUnitConversion> UnitConversions { get; set; }
    public DbSet<WixiServiceCategory> ServiceCategories { get; set; }
    public DbSet<WixiService> Services { get; set; }
    public DbSet<WixiProductDescription> ProductDescriptions { get; set; }
    public DbSet<WixiHsCode> HsCodes { get; set; }

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

        // Platform Payment Settings Mapping
        builder.Entity<WixiPlatformPaymentSetting>(entity =>
        {
            entity.ToTable("WIXI_PLATFORM_PAYMENT_SETTINGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StripeSecretKey).HasMaxLength(1000);
            entity.Property(e => e.StripePublishableKey).HasMaxLength(1000);
            entity.Property(e => e.StripeWebhookSecret).HasMaxLength(1000);
            entity.Property(e => e.IyzipayApiKey).HasMaxLength(1000);
            entity.Property(e => e.IyzipaySecretKey).HasMaxLength(1000);
            entity.Property(e => e.IyzipayBaseUrl).HasMaxLength(300);
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

        // Reference Data — Phase C1

        builder.Entity<WixiSystemPage>(entity =>
        {
            entity.ToTable("WIXI_SYSTEM_PAGES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Path).IsUnique();
            entity.Property(e => e.Path).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Group).HasMaxLength(100);
            entity.Property(e => e.Icon).HasMaxLength(100);
        });

        builder.Entity<WixiRegion>(entity =>
        {
            entity.ToTable("WIXI_REGIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        builder.Entity<WixiPort>(entity =>
        {
            entity.ToTable("WIXI_PORTS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnLocode).IsRequired().HasMaxLength(10);
            entity.HasIndex(e => e.UnLocode).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.NameEn).HasMaxLength(150);
            entity.Property(e => e.CountryCode).IsRequired().HasMaxLength(3);
            entity.Property(e => e.CityName).HasMaxLength(100);
        });

        builder.Entity<WixiPaymentTerm>(entity =>
        {
            entity.ToTable("WIXI_PAYMENT_TERMS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        builder.Entity<WixiTaxOffice>(entity =>
        {
            entity.ToTable("WIXI_TAX_OFFICES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.CityName).HasMaxLength(100);
            entity.Property(e => e.CountryCode).HasMaxLength(3);
        });

        builder.Entity<WixiIncoterm>(entity =>
        {
            entity.ToTable("WIXI_INCOTERMS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(5);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.DescriptionEn).HasMaxLength(1000);
        });

        builder.Entity<WixiTransportMode>(entity =>
        {
            entity.ToTable("WIXI_TRANSPORT_MODES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.NameEn).HasMaxLength(50);
            entity.Property(e => e.Icon).HasMaxLength(50);
            entity.Property(e => e.ColorHex).HasMaxLength(10);
        });

        builder.Entity<WixiPackageType>(entity =>
        {
            entity.ToTable("WIXI_PACKAGE_TYPES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Symbol).HasMaxLength(20);
        });

        // Landing Content

        builder.Entity<WixiFaqCategory>(entity =>
        {
            entity.ToTable("WIXI_FAQ_CATEGORIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        builder.Entity<WixiFaqCategoryTranslation>(entity =>
        {
            entity.ToTable("WIXI_FAQ_CATEGORY_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Label).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Translations)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiFaq>(entity =>
        {
            entity.ToTable("WIXI_FAQS");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Faqs)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<WixiFaqTranslation>(entity =>
        {
            entity.ToTable("WIXI_FAQ_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Answer).IsRequired().HasMaxLength(4000);

            entity.HasOne(e => e.Faq)
                  .WithMany(f => f.Translations)
                  .HasForeignKey(e => e.FaqId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiContactSubmission>(entity =>
        {
            entity.ToTable("WIXI_CONTACT_SUBMISSIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Phone).HasMaxLength(30);
            entity.Property(e => e.Topic).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(4000);
            entity.Property(e => e.Source).HasMaxLength(100);
        });

        builder.Entity<WixiPlatformStat>(entity =>
        {
            entity.ToTable("WIXI_PLATFORM_STATS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StatKey).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.StatKey).IsUnique();
            entity.Property(e => e.DisplayValue).IsRequired().HasMaxLength(50);
        });

        builder.Entity<WixiPlatformStatTranslation>(entity =>
        {
            entity.ToTable("WIXI_PLATFORM_STAT_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Label).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.Stat)
                  .WithMany(s => s.Translations)
                  .HasForeignKey(e => e.StatId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Landing Content — Wave 2

        builder.Entity<WixiTeamMember>(entity =>
        {
            entity.ToTable("WIXI_TEAM_MEMBERS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Initials).IsRequired().HasMaxLength(10);
            entity.Property(e => e.AvatarUrl).HasMaxLength(500);
            entity.Property(e => e.AvatarColor).IsRequired().HasMaxLength(20);
        });

        builder.Entity<WixiTeamMemberTranslation>(entity =>
        {
            entity.ToTable("WIXI_TEAM_MEMBER_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Member)
                  .WithMany(m => m.Translations)
                  .HasForeignKey(e => e.MemberId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiCompanyMilestone>(entity =>
        {
            entity.ToTable("WIXI_COMPANY_MILESTONES");
            entity.HasKey(e => e.Id);
        });

        builder.Entity<WixiCompanyMilestoneTranslation>(entity =>
        {
            entity.ToTable("WIXI_COMPANY_MILESTONE_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Description).HasMaxLength(1000);

            entity.HasOne(e => e.Milestone)
                  .WithMany(m => m.Translations)
                  .HasForeignKey(e => e.MilestoneId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiCaseStudy>(entity =>
        {
            entity.ToTable("WIXI_CASE_STUDIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ClientSlug).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.ClientSlug).IsUnique();
            entity.Property(e => e.ClientInitials).IsRequired().HasMaxLength(10);
            entity.Property(e => e.ClientLogoUrl).HasMaxLength(500);
            entity.Property(e => e.Industry).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Metric1Value).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Metric2Value).IsRequired().HasMaxLength(50);
        });

        builder.Entity<WixiCaseStudyTranslation>(entity =>
        {
            entity.ToTable("WIXI_CASE_STUDY_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ClientName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(400);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.Metric1Label).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Metric2Label).IsRequired().HasMaxLength(100);
            entity.Property(e => e.QuoteText).HasMaxLength(1000);
            entity.Property(e => e.QuoteAuthor).HasMaxLength(200);

            entity.HasOne(e => e.CaseStudy)
                  .WithMany(c => c.Translations)
                  .HasForeignKey(e => e.CaseStudyId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiRoadmapItem>(entity =>
        {
            entity.ToTable("WIXI_ROADMAP_ITEMS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Phase).IsRequired().HasMaxLength(20);
            entity.Property(e => e.PhaseLabel).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PlannedDate).IsRequired().HasMaxLength(100);
        });

        builder.Entity<WixiRoadmapItemTranslation>(entity =>
        {
            entity.ToTable("WIXI_ROADMAP_ITEM_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);

            entity.HasOne(e => e.Item)
                  .WithMany(i => i.Translations)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiRoadmapVote>(entity =>
        {
            entity.ToTable("WIXI_ROADMAP_VOTES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionToken).IsRequired().HasMaxLength(128);
            entity.Property(e => e.IpHash).HasMaxLength(128);
            entity.HasIndex(v => new { v.ItemId, v.SessionToken }).IsUnique();

            entity.HasOne(e => e.Item)
                  .WithMany(i => i.Votes)
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<WixiChangelogEntry>(entity =>
        {
            entity.ToTable("WIXI_CHANGELOG_ENTRIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Version).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Tag).IsRequired().HasMaxLength(30);
        });

        builder.Entity<WixiChangelogTranslation>(entity =>
        {
            entity.ToTable("WIXI_CHANGELOG_TRANSLATIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);

            entity.HasOne(e => e.Entry)
                  .WithMany(e => e.Translations)
                  .HasForeignKey(e => e.EntryId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Landing Content — Wave 3

        builder.Entity<WixiLegalDocument>().ToTable("WIXI_LEGAL_DOCUMENTS");
        builder.Entity<WixiLegalDocumentTranslation>().ToTable("WIXI_LEGAL_DOCUMENT_TRANSLATIONS");

        builder.Entity<WixiLegalDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Slug);
            entity.Property(e => e.Version).IsRequired().HasMaxLength(20);
        });

        builder.Entity<WixiLegalDocumentTranslation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300);

            entity.HasOne(e => e.Document)
                  .WithMany(d => d.Translations)
                  .HasForeignKey(e => e.DocumentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Language)
                  .WithMany()
                  .HasForeignKey(e => e.LanguageId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Reference Data — Phase C2

        builder.Entity<WixiUnitCategory>(entity =>
        {
            entity.ToTable("WIXI_UNIT_CATEGORIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
        });

        builder.Entity<WixiUnit>(entity =>
        {
            entity.ToTable("WIXI_UNITS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Symbol).HasMaxLength(20);
            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Units)
                  .HasForeignKey(e => e.UnitCategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<WixiUnitConversion>(entity =>
        {
            entity.ToTable("WIXI_UNIT_CONVERSIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Factor).HasColumnType("decimal(18,8)");
            entity.HasOne(e => e.FromUnit)
                  .WithMany()
                  .HasForeignKey(e => e.FromUnitId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.ToUnit)
                  .WithMany()
                  .HasForeignKey(e => e.ToUnitId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiServiceCategory>(entity =>
        {
            entity.ToTable("WIXI_SERVICE_CATEGORIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ColorHex).HasMaxLength(10);
            entity.Property(e => e.Icon).HasMaxLength(50);
        });

        builder.Entity<WixiService>(entity =>
        {
            entity.ToTable("WIXI_SERVICES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Services)
                  .HasForeignKey(e => e.ServiceCategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<WixiProductDescription>(entity =>
        {
            entity.ToTable("WIXI_PRODUCT_DESCRIPTIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(30);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.NameEn).HasMaxLength(200);
            entity.Property(e => e.HsCode).HasMaxLength(20);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        builder.Entity<WixiHsCode>(entity =>
        {
            entity.ToTable("WIXI_HS_CODES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(12);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
            entity.Property(e => e.NameEn).HasMaxLength(500);
            entity.HasOne(e => e.Parent)
                  .WithMany(p => p.Children)
                  .HasForeignKey(e => e.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Reference Data — Geography

        builder.Entity<WixiCountry>(entity =>
        {
            entity.ToTable("WIXI_COUNTRIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Iso2).IsRequired().HasMaxLength(2);
            entity.HasIndex(e => e.Iso2).IsUnique();
            entity.Property(e => e.Iso3).IsRequired().HasMaxLength(3);
            entity.HasIndex(e => e.Iso3).IsUnique();
            entity.Property(e => e.PhoneCode).HasMaxLength(20);
            entity.Property(e => e.Capital).HasMaxLength(150);
            entity.Property(e => e.Currency).HasMaxLength(10);
            entity.Property(e => e.CurrencyName).HasMaxLength(100);
            entity.Property(e => e.CurrencySymbol).HasMaxLength(10);
            entity.Property(e => e.Region).HasMaxLength(100);
            entity.Property(e => e.SubRegion).HasMaxLength(100);
            entity.Property(e => e.Latitude).HasColumnType("decimal(10,8)");
            entity.Property(e => e.Longitude).HasColumnType("decimal(11,8)");
            entity.Property(e => e.Flag).HasMaxLength(10);
        });

        builder.Entity<WixiState>(entity =>
        {
            entity.ToTable("WIXI_STATES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.StateCode).HasMaxLength(10);
            entity.Property(e => e.CountryCode).HasMaxLength(2);
            entity.Property(e => e.Latitude).HasColumnType("decimal(10,8)");
            entity.Property(e => e.Longitude).HasColumnType("decimal(11,8)");
            entity.HasOne(e => e.Country)
                  .WithMany()
                  .HasForeignKey(e => e.CountryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WixiCity>(entity =>
        {
            entity.ToTable("WIXI_CITIES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Latitude).HasColumnType("decimal(10,8)");
            entity.Property(e => e.Longitude).HasColumnType("decimal(11,8)");
            entity.HasOne(e => e.State)
                  .WithMany()
                  .HasForeignKey(e => e.StateId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Country)
                  .WithMany()
                  .HasForeignKey(e => e.CountryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }

    // Seed operasyonlarında audit log oluşturmadan kaydetmek için
    internal async Task<int> RawSaveAsync(CancellationToken ct = default)
        => await base.SaveChangesAsync(ct);

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
