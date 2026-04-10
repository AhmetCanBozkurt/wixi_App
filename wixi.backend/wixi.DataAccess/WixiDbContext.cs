using Microsoft.EntityFrameworkCore;
using wixi.Identity.Entities;
using wixi.Clients.Entities;
using wixi.Documents.Entities;
using wixi.Applications.Entities;
using wixi.Support.Entities;
using wixi.Email.Entities;
using wixi.Forms.Entities;
using wixi.Content.Entities;
using wixi.Appointments.Entities;
using wixi.Payments.Entities;
using wixi.CVBuilder.Entities;
using wixi.Tekstil.Entities;

namespace wixi.DataAccess;

public class WixiDbContext : DbContext
{
    public WixiDbContext(DbContextOptions<WixiDbContext> options) : base(options)
    {
    }

    // Identity Tables
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<TokenBlacklist> TokenBlacklists { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<MenuPermission> MenuPermissions { get; set; }
    public DbSet<UserTablePreference> UserTablePreferences { get; set; }
    
    // Client Management Tables
    public DbSet<Client> Clients { get; set; }
    public DbSet<EducationType> EducationTypes { get; set; }
    public DbSet<EducationInfo> EducationInfos { get; set; }
    public DbSet<PendingClientCode> PendingClientCodes { get; set; }
    public DbSet<ClientNote> ClientNotes { get; set; }
    
    // Document Management Tables
    public DbSet<Document> Documents { get; set; }
    public DbSet<DocumentType> DocumentTypes { get; set; }
    public DbSet<DocumentReview> DocumentReviews { get; set; }
    public DbSet<FileStorage> FileStorages { get; set; }
    public DbSet<DocumentAnalysis> DocumentAnalyses { get; set; }
    
    // CV Builder Tables
    public DbSet<CVData> CVData { get; set; }
    
    // Application Management Tables
    public DbSet<Application> Applications { get; set; }
    public DbSet<ApplicationTemplate> ApplicationTemplates { get; set; }
    public DbSet<ApplicationStep> ApplicationSteps { get; set; }
    public DbSet<ApplicationStepTemplate> ApplicationStepTemplates { get; set; }
    public DbSet<ApplicationSubStep> ApplicationSubSteps { get; set; }
    public DbSet<ApplicationSubStepTemplate> ApplicationSubStepTemplates { get; set; }
    public DbSet<ApplicationHistory> ApplicationHistories { get; set; }
    
    // Support System Tables
    public DbSet<SupportTicket> SupportTickets { get; set; }
    public DbSet<SupportMessage> SupportMessages { get; set; }
    public DbSet<FAQ> FAQs { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    
    // Email System Tables
    public DbSet<EmailTemplate> EmailTemplates { get; set; }
    public DbSet<EmailLog> EmailLogs { get; set; }
    public DbSet<SmtpSettings> SmtpSettings { get; set; }
    
    // Form Submission Tables
    public DbSet<EmployerFormSubmission> EmployerFormSubmissions { get; set; }
    public DbSet<EmployeeFormSubmission> EmployeeFormSubmissions { get; set; }
    public DbSet<ContactFormSubmission> ContactFormSubmissions { get; set; }
    
    // Content Management Tables
    public DbSet<NewsItem> NewsItems { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<Translation> Translations { get; set; }
    public DbSet<ContentSettings> ContentSettings { get; set; }
    public DbSet<EquivalencyFeeSettings> EquivalencyFeeSettings { get; set; }
    public DbSet<SystemSettings> SystemSettings { get; set; }
    public DbSet<LicenseSettings> LicenseSettings { get; set; }
    public DbSet<UserPreference> UserPreferences { get; set; }
    
    // Appointment Management Tables
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<Holiday> Holidays { get; set; }
    
    // Payment Management Tables
    public DbSet<Payment> Payments { get; set; }
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
    public DbSet<PaymentItem> PaymentItems { get; set; }
    public DbSet<PaymentRefund> PaymentRefunds { get; set; }
    
    // Testimonial Management Tables
    public DbSet<Testimonial> Testimonials { get; set; }
    public DbSet<ProjectReference> ProjectReferences { get; set; }
    
    // Tekstil Module Tables
    public DbSet<wixi.Tekstil.Entities.Language> TekstilLanguages { get; set; }
    public DbSet<wixi.Tekstil.Entities.About> TekstilAbout { get; set; }
    public DbSet<wixi.Tekstil.Entities.AboutTranslation> TekstilAboutTranslations { get; set; }
    public DbSet<wixi.Tekstil.Entities.Stat> TekstilStats { get; set; }
    public DbSet<wixi.Tekstil.Entities.StatTranslation> TekstilStatTranslations { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProductCategory> TekstilProductCategories { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProductCategoryTranslation> TekstilProductCategoryTranslations { get; set; }
    public DbSet<wixi.Tekstil.Entities.Product> TekstilProducts { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProductTranslation> TekstilProductTranslations { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProductImage> TekstilProductImages { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProjectCategory> TekstilProjectCategories { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProjectCategoryTranslation> TekstilProjectCategoryTranslations { get; set; }
    public DbSet<wixi.Tekstil.Entities.Project> TekstilProjects { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProjectTranslation> TekstilProjectTranslations { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProjectImage> TekstilProjectImages { get; set; }
    public DbSet<wixi.Tekstil.Entities.ProjectTag> TekstilProjectTags { get; set; }
    public DbSet<wixi.Tekstil.Entities.ContactInfo> TekstilContactInfo { get; set; }
    public DbSet<wixi.Tekstil.Entities.ContactInfoTranslation> TekstilContactInfoTranslations { get; set; }
    public DbSet<wixi.Tekstil.Entities.ContactSubmission> TekstilContactSubmissions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations from all assemblies
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WixiDbContext).Assembly);
        
        // Identity configurations
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("wixi_Users");
            entity.HasKey(e => e.Id);
            
            // Unique indexes
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.NormalizedEmail).IsUnique();
            entity.HasIndex(e => e.UserName).IsUnique();
            entity.HasIndex(e => e.NormalizedUserName).IsUnique();
            
            // Required fields with max length
            entity.Property(e => e.UserName).IsRequired().HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.NormalizedEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.SecurityStamp).IsRequired().HasMaxLength(256);
            // ConcurrencyStamp is optional (set by EF Core Identity when needed)
            entity.Property(e => e.ConcurrencyStamp).HasMaxLength(256);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.TwoFactorCode).HasMaxLength(10);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("wixi_Roles");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.NormalizedName).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.NormalizedName).HasMaxLength(256);
            entity.Property(e => e.ConcurrencyStamp).HasMaxLength(256);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("wixi_UserRoles");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MenuPermission>(entity =>
        {
            entity.ToTable("wixi_MenuPermissions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.MenuPath, e.UserId }).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.MenuPath);
            
            entity.Property(e => e.MenuPath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.MenuText).IsRequired().HasMaxLength(200);
            entity.Property(e => e.MenuCategory).HasMaxLength(200);
            entity.Property(e => e.MenuIcon).HasMaxLength(100);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserTablePreference>(entity =>
        {
            entity.ToTable("wixi_UserTablePreferences");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.TableKey }).IsUnique();
            entity.Property(e => e.TableKey).IsRequired().HasMaxLength(200);
            entity.Property(e => e.VisibleColumns).IsRequired().HasDefaultValue("[]");
            entity.Property(e => e.ColumnOrder).IsRequired().HasDefaultValue("[]");
            entity.Property(e => e.ColumnFilters).IsRequired().HasDefaultValue("{}");
            entity.Property(e => e.SortConfig).IsRequired().HasDefaultValue("{}");
            entity.Property(e => e.PageSize).IsRequired().HasDefaultValue(20);
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("wixi_RefreshTokens");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TokenBlacklist>(entity =>
        {
            entity.ToTable("wixi_TokenBlacklists");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ExpirationDate);
            entity.Property(e => e.Token).IsRequired();
            entity.Property(e => e.Reason).HasMaxLength(500);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("wixi_AuditLogs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Action);
        });

        // Client Management configurations
        modelBuilder.Entity<Client>(entity =>
        {
            entity.ToTable("wixi_Clients");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.ClientCode).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ClientCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<EducationType>(entity =>
        {
            entity.ToTable("wixi_EducationTypes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name_TR).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Name_EN).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Name_DE).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Name_AR).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<EducationInfo>(entity =>
        {
            entity.ToTable("wixi_EducationInfos");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ClientId);
            entity.Property(e => e.Degree).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Institution).IsRequired().HasMaxLength(300);
            entity.Property(e => e.GPA).HasPrecision(3, 2); // 0.00 to 9.99
            
            entity.HasOne(e => e.Client)
                .WithMany(c => c.EducationInfos)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PendingClientCode>(entity =>
        {
            entity.ToTable("wixi_PendingClientCodes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Code);
            entity.HasIndex(e => e.ClientCode);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.Property(e => e.ClientCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<ClientNote>(entity =>
        {
            entity.ToTable("wixi_ClientNotes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.CreatedByUserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(5000);
            entity.Property(e => e.IsPinned).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.IsVisibleToClient).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired(false);

            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Document Management configurations
        modelBuilder.Entity<Document>(entity =>
        {
            entity.ToTable("wixi_Documents");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.DocumentTypeId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.UploadedAt);
            entity.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(500);
            entity.Property(e => e.StoredFileName).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.FileExtension).IsRequired().HasMaxLength(20);
            
            entity.HasOne(e => e.DocumentType)
                .WithMany(dt => dt.Documents)
                .HasForeignKey(e => e.DocumentTypeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DocumentType>(entity =>
        {
            entity.ToTable("wixi_DocumentTypes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.EducationTypeId);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name_TR).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_EN).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_DE).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_AR).IsRequired().HasMaxLength(500);
        });

        modelBuilder.Entity<DocumentReview>(entity =>
        {
            entity.ToTable("wixi_DocumentReviews");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.DocumentId);
            entity.HasIndex(e => e.ReviewerId);
            entity.HasIndex(e => e.ReviewedAt);
            
            entity.HasOne(e => e.Document)
                .WithOne(d => d.Review)
                .HasForeignKey<DocumentReview>(e => e.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FileStorage>(entity =>
        {
            entity.ToTable("wixi_FileStorages");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
            entity.HasIndex(e => e.FileHash);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(500);
            entity.Property(e => e.StoredFileName).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.MimeType).IsRequired().HasMaxLength(200);
        });

        // Application Management configurations
        modelBuilder.Entity<Application>(entity =>
        {
            entity.ToTable("wixi_Applications");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ApplicationNumber).IsUnique();
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.ApplicationTemplateId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.StartDate);
            entity.Property(e => e.ApplicationNumber).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.Template)
                .WithMany(t => t.Applications)
                .HasForeignKey(e => e.ApplicationTemplateId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicationTemplate>(entity =>
        {
            entity.ToTable("wixi_ApplicationTemplates");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Type);
            entity.Property(e => e.Name_TR).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_EN).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_DE).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_AR).IsRequired().HasMaxLength(500);
        });

        modelBuilder.Entity<ApplicationStep>(entity =>
        {
            entity.ToTable("wixi_ApplicationSteps");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.StepTemplateId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            
            entity.HasOne(e => e.Application)
                .WithMany(a => a.Steps)
                .HasForeignKey(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Template)
                .WithMany(t => t.Steps)
                .HasForeignKey(e => e.StepTemplateId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicationStepTemplate>(entity =>
        {
            entity.ToTable("wixi_ApplicationStepTemplates");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ApplicationTemplateId);
            entity.Property(e => e.Title_TR).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Title_EN).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Title_DE).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Title_AR).IsRequired().HasMaxLength(500);
            
            entity.HasOne(e => e.Template)
                .WithMany(t => t.StepTemplates)
                .HasForeignKey(e => e.ApplicationTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApplicationSubStep>(entity =>
        {
            entity.ToTable("wixi_ApplicationSubSteps");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ApplicationStepId);
            entity.HasIndex(e => e.SubStepTemplateId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
            
            entity.HasOne(e => e.Step)
                .WithMany(s => s.SubSteps)
                .HasForeignKey(e => e.ApplicationStepId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Template)
                .WithMany(t => t.SubSteps)
                .HasForeignKey(e => e.SubStepTemplateId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicationSubStepTemplate>(entity =>
        {
            entity.ToTable("wixi_ApplicationSubStepTemplates");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StepTemplateId);
            entity.Property(e => e.Name_TR).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_EN).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_DE).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Name_AR).IsRequired().HasMaxLength(500);
            
            entity.HasOne(e => e.StepTemplate)
                .WithMany(t => t.SubStepTemplates)
                .HasForeignKey(e => e.StepTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApplicationHistory>(entity =>
        {
            entity.ToTable("wixi_ApplicationHistories");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            
            entity.HasOne(e => e.Application)
                .WithMany(a => a.History)
                .HasForeignKey(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Support System configurations
        modelBuilder.Entity<SupportTicket>(entity =>
        {
            entity.ToTable("wixi_SupportTickets");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TicketNumber).IsUnique();
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.AssignedToId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.TicketNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
        });

        modelBuilder.Entity<SupportMessage>(entity =>
        {
            entity.ToTable("wixi_SupportMessages");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TicketId);
            entity.HasIndex(e => e.SenderId);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.Message).IsRequired();
            
            entity.HasOne(e => e.Ticket)
                .WithMany(t => t.Messages)
                .HasForeignKey(e => e.TicketId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FAQ>(entity =>
        {
            entity.ToTable("wixi_FAQs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsFeatured);
            entity.Property(e => e.Question_TR).IsRequired();
            entity.Property(e => e.Question_EN).IsRequired();
            entity.Property(e => e.Question_DE).IsRequired();
            entity.Property(e => e.Question_AR).IsRequired();
            entity.Property(e => e.Answer_TR).IsRequired();
            entity.Property(e => e.Answer_EN).IsRequired();
            entity.Property(e => e.Answer_DE).IsRequired();
            entity.Property(e => e.Answer_AR).IsRequired();
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("wixi_Notifications");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.IsRead);
            entity.HasIndex(e => e.IsArchived);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.RelatedEntityType, e.RelatedEntityId });
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Message).IsRequired();
        });

        // Appointment System configurations
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("wixi_Appointments");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StartTime);
            entity.HasIndex(e => e.EndTime);
            entity.HasIndex(e => e.ClientId);
            entity.HasIndex(e => e.CreatedById);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ClientName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ClientPhone).HasMaxLength(50);
            entity.Property(e => e.ClientEmail).HasMaxLength(200);
            entity.Property(e => e.Color).HasMaxLength(20).HasDefaultValue("#3B82F6");
            
            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
                
            entity.HasOne<Client>()
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        modelBuilder.Entity<Holiday>(entity =>
        {
            entity.ToTable("wixi_Holidays");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Date);
            entity.HasIndex(e => e.CountryCode);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CountryCode).HasMaxLength(10).HasDefaultValue("TR");
        });

        // Payment System configurations
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("wixi_Payments");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PaymentNumber).IsUnique();
            entity.HasIndex(e => e.IyzicoPaymentId);
            entity.HasIndex(e => e.AppointmentId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.PaymentNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PaymentProvider).IsRequired().HasMaxLength(50).HasDefaultValue("Iyzico");
            entity.Property(e => e.ProviderPaymentId).HasMaxLength(100);
            entity.Property(e => e.ConversationId).HasMaxLength(100);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CustomerEmail).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CustomerPhone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CustomerIdentityNumber).HasMaxLength(20);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaidAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Currency).HasMaxLength(3).HasDefaultValue("EUR");
            entity.Property(e => e.ExchangeRate).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.RelatedEntityType).HasMaxLength(50);
            entity.Property(e => e.IyzicoPaymentId).HasMaxLength(100);
            entity.Property(e => e.IyzicoConversationId).HasMaxLength(100);
            entity.Property(e => e.IyzicoStatus).HasMaxLength(50);
            entity.Property(e => e.IyzicoErrorCode).HasMaxLength(50);
            entity.Property(e => e.IyzicoErrorMessage).HasMaxLength(500);
            entity.Property(e => e.CardLastFourDigits).HasMaxLength(4);
            entity.Property(e => e.CardHolderName).HasMaxLength(100);
            entity.Property(e => e.CardBrand).HasMaxLength(50);
            entity.Property(e => e.CardType).HasMaxLength(50);
            entity.Property(e => e.InstallmentAmount).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Appointment)
                .WithMany()
                .HasForeignKey(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.ToTable("wixi_PaymentTransactions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PaymentId);
            entity.HasIndex(e => e.TransactionId);
            entity.Property(e => e.TransactionId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Currency).HasMaxLength(3).HasDefaultValue("EUR");
            entity.Property(e => e.ErrorCode).HasMaxLength(50);
            entity.Property(e => e.ErrorMessage).HasMaxLength(500);
            
            entity.HasOne(e => e.Payment)
                .WithMany(p => p.Transactions)
                .HasForeignKey(e => e.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PaymentItem>(entity =>
        {
            entity.ToTable("wixi_PaymentItems");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PaymentId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RelatedEntityType).HasMaxLength(50);
            
            entity.HasOne(e => e.Payment)
                .WithMany(p => p.Items)
                .HasForeignKey(e => e.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Document Analysis Configuration
        modelBuilder.Entity<DocumentAnalysis>(entity =>
        {
            entity.ToTable("wixi_DocumentAnalyses");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.DocumentId).IsUnique();
            entity.Property(e => e.Recommendations).HasMaxLength(4000);
            entity.Property(e => e.AnalysisMethod).HasMaxLength(50);
            
            entity.HasOne(e => e.Document)
                .WithMany()
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CV Data Configuration
        modelBuilder.Entity<CVData>(entity =>
        {
            entity.ToTable("wixi_CVData");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SessionId).IsUnique();
            entity.HasIndex(e => e.PaymentId);
            entity.HasIndex(e => e.ClientId);
            entity.Property(e => e.PersonalInfo).IsRequired();
            entity.Property(e => e.Experience).IsRequired();
            entity.Property(e => e.Education).IsRequired();
            entity.Property(e => e.Skills).IsRequired();
            entity.Property(e => e.Languages).IsRequired();
            entity.Property(e => e.Certificates).IsRequired();
            
            entity.HasOne(e => e.Payment)
                .WithMany()
                .HasForeignKey(e => e.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Document)
                .WithMany()
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        modelBuilder.Entity<PaymentRefund>(entity =>
        {
            entity.ToTable("wixi_PaymentRefunds");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PaymentId);
            entity.HasIndex(e => e.RefundNumber).IsUnique();
            entity.Property(e => e.RefundNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Currency).HasMaxLength(3).HasDefaultValue("EUR");
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.IyzicoRefundId).HasMaxLength(100);
            
            entity.HasOne(e => e.Payment)
                .WithMany(p => p.Refunds)
                .HasForeignKey(e => e.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Email System configurations
        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity.ToTable("wixi_EmailTemplates");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.HasIndex(e => e.IsActive);
            entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DisplayName_TR).IsRequired().HasMaxLength(200);
            entity.Property(e => e.DisplayName_EN).IsRequired().HasMaxLength(200);
            entity.Property(e => e.DisplayName_DE).IsRequired().HasMaxLength(200);
            entity.Property(e => e.DisplayName_AR).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Subject_TR).IsRequired();
            entity.Property(e => e.Subject_EN).IsRequired();
            entity.Property(e => e.Subject_DE).IsRequired();
            entity.Property(e => e.Subject_AR).IsRequired();
            entity.Property(e => e.BodyHtml_TR).IsRequired();
            entity.Property(e => e.BodyHtml_EN).IsRequired();
            entity.Property(e => e.BodyHtml_DE).IsRequired();
            entity.Property(e => e.BodyHtml_AR).IsRequired();
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        modelBuilder.Entity<EmailLog>(entity =>
        {
            entity.ToTable("wixi_EmailLogs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CorrelationId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.TemplateKey);
            entity.Property(e => e.FromEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.ToEmails).IsRequired().HasMaxLength(1000);
        });

        modelBuilder.Entity<SmtpSettings>(entity =>
        {
            entity.ToTable("wixi_SmtpSettings");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsDefault);
            entity.Property(e => e.Host).IsRequired().HasMaxLength(256);
            entity.Property(e => e.UserName).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordEnc).IsRequired();
            entity.Property(e => e.FromEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        // Form Submission configurations
        modelBuilder.Entity<EmployerFormSubmission>(entity =>
        {
            entity.ToTable("wixi_EmployerFormSubmissions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ContactPerson).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Industry).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CompanySize).HasMaxLength(50);
            entity.Property(e => e.Positions).IsRequired();
            entity.Property(e => e.Requirements).IsRequired();
            entity.Property(e => e.RequestIp).HasMaxLength(50);
            entity.Property(e => e.Language).HasMaxLength(10);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<EmployeeFormSubmission>(entity =>
        {
            entity.ToTable("wixi_EmployeeFormSubmissions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Salutation).HasMaxLength(20);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Profession).HasMaxLength(100);
            entity.Property(e => e.Education).HasMaxLength(200);
            entity.Property(e => e.GermanLevel).HasMaxLength(50);
            entity.Property(e => e.CvFileName).HasMaxLength(500);
            entity.Property(e => e.CvFilePath).HasMaxLength(1000);
            entity.Property(e => e.RequestIp).HasMaxLength(50);
            entity.Property(e => e.Language).HasMaxLength(10);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<ContactFormSubmission>(entity =>
        {
            entity.ToTable("wixi_ContactFormSubmissions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Nationality).HasMaxLength(100);
            entity.Property(e => e.Education).HasMaxLength(200);
            entity.Property(e => e.FieldOfStudy).HasMaxLength(200);
            entity.Property(e => e.GermanLevel).HasMaxLength(50);
            entity.Property(e => e.EnglishLevel).HasMaxLength(50);
            entity.Property(e => e.Interest).HasMaxLength(200);
            entity.Property(e => e.PreferredCity).HasMaxLength(100);
            entity.Property(e => e.Timeline).HasMaxLength(100);
            entity.Property(e => e.RequestIp).HasMaxLength(50);
            entity.Property(e => e.Language).HasMaxLength(10);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
        });

        // Content Management configurations
        modelBuilder.Entity<NewsItem>(entity =>
        {
            entity.ToTable("wixi_NewsItems");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.Featured);
            entity.HasIndex(e => e.PublishedAt);
            entity.Property(e => e.TitleDe).IsRequired().HasMaxLength(500);
            entity.Property(e => e.TitleTr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ExcerptDe).IsRequired();
            entity.Property(e => e.ExcerptTr).IsRequired();
            entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Slug).HasMaxLength(500);
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.ToTable("wixi_TeamMembers");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.DisplayOrder);
            entity.HasIndex(e => e.CanProvideConsultation);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Experience).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PositionDe).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PositionTr).IsRequired().HasMaxLength(200);
            entity.Property(e => e.LocationDe).IsRequired().HasMaxLength(200);
            entity.Property(e => e.LocationTr).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CanProvideConsultation).HasDefaultValue(false);
            entity.Property(e => e.ConsultationPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ConsultationCurrency).HasMaxLength(10);
        });

        modelBuilder.Entity<Translation>(entity =>
        {
            entity.ToTable("wixi_Translations");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.Property(e => e.Key).IsRequired().HasMaxLength(200);
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        modelBuilder.Entity<ContentSettings>(entity =>
        {
            entity.ToTable("wixi_ContentSettings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FooterCompanyDescDe).IsRequired();
            entity.Property(e => e.FooterCompanyDescTr).IsRequired();
            entity.Property(e => e.AboutMissionText1De).IsRequired();
            entity.Property(e => e.AboutMissionText1Tr).IsRequired();
            entity.Property(e => e.AboutMissionText2De).IsRequired();
            entity.Property(e => e.AboutMissionText2Tr).IsRequired();
            entity.Property(e => e.ContactPhone).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ContactEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        modelBuilder.Entity<EquivalencyFeeSettings>(entity =>
        {
            entity.ToTable("wixi_EquivalencyFeeSettings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("EUR");
            entity.Property(e => e.WhyPayTitleTr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.WhyPayDescriptionTr).IsRequired();
            entity.Property(e => e.WhyProcessTitleTr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.WhyProcessItemsTr).IsRequired();
            entity.Property(e => e.FeeScopeTitleTr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FeeScopeItemsTr).IsRequired();
            entity.Property(e => e.PaymentSummaryTitleTr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.PaymentSummaryDescriptionTr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FeeItemDescriptionTr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        modelBuilder.Entity<SystemSettings>(entity =>
        {
            entity.ToTable("wixi_SystemSettings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SiteName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.SiteUrl).IsRequired().HasMaxLength(500);
            entity.Property(e => e.AdminEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        modelBuilder.Entity<LicenseSettings>(entity =>
        {
            entity.ToTable("wixi_LicenseSettings");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.LicenseKey).IsUnique();
            entity.HasIndex(e => e.IsValid);
            entity.HasIndex(e => e.IsActive);
            entity.Property(e => e.LicenseKey).IsRequired().HasMaxLength(100);
            entity.Property(e => e.TenantCompanyName).HasMaxLength(200);
            entity.Property(e => e.MachineCode).HasMaxLength(100);
            entity.Property(e => e.ClientVersion).HasMaxLength(50);
            entity.Property(e => e.ValidationResult).HasColumnType("nvarchar(max)");
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        modelBuilder.Entity<UserPreference>(entity =>
        {
            entity.ToTable("wixi_UserPreferences");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.Language).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Theme).IsRequired().HasMaxLength(20);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Roles and other entities - Hardcoded date to avoid migration warnings
        var seedDate = new DateTime(2025, 11, 8, 0, 0, 0, DateTimeKind.Utc);
        
        // Seed DocumentTypes with multi-language support (TR, EN, DE, AR)
        modelBuilder.Entity<DocumentType>().HasData(
            // Passport
            new DocumentType
            {
                Id = 1,
                Code = "passport",
                Name_TR = "Pasaport (Renkli Fotokopi - PDF)",
                Name_EN = "Passport (Color Copy - PDF)",
                Name_DE = "Reisepass (Farbkopie - PDF)",
                Name_AR = "جواز السفر (نسخة ملونة - PDF)",
                Description_TR = "Pasaportunuzun tüm sayfalarının renkli taranmış kopyası",
                Description_EN = "Color scanned copy of all pages of your passport",
                Description_DE = "Farbige gescannte Kopie aller Seiten Ihres Reisepasses",
                Description_AR = "نسخة ملونة ممسوحة ضوئيًا لجميع صفحات جواز سفرك",
                IsRequired = true,
                IsActive = true,
                AllowedFileTypes = ".pdf",
                MaxFileSizeBytes = 10485760, // 10MB
                RequiresApproval = true,
                DisplayOrder = 1,
                IconName = "passport",
                CreatedAt = seedDate
            },
            // CV/Resume
            new DocumentType
            {
                Id = 2,
                Code = "cv",
                Name_TR = "Özgeçmiş / CV",
                Name_EN = "Resume / CV",
                Name_DE = "Lebenslauf / CV",
                Name_AR = "السيرة الذاتية",
                Description_TR = "Güncel özgeçmişiniz (Almanca veya İngilizce tercih edilir)",
                Description_EN = "Your current resume (German or English preferred)",
                Description_DE = "Ihr aktueller Lebenslauf (Deutsch oder Englisch bevorzugt)",
                Description_AR = "سيرتك الذاتية الحالية (يفضل الألمانية أو الإنجليزية)",
                Note_TR = "20€ ücret karşılığında Almanca CV hazırlama hizmeti sunuyoruz",
                Note_EN = "We offer German CV preparation service for 20€",
                Note_DE = "Wir bieten einen deutschen Lebenslauf-Erstellungsservice für 20€ an",
                Note_AR = "نقدم خدمة إعداد السيرة الذاتية باللغة الألمانية مقابل 20 يورو",
                IsRequired = true,
                IsActive = true,
                AllowedFileTypes = ".pdf,.doc,.docx",
                MaxFileSizeBytes = 5242880, // 5MB
                RequiresApproval = true,
                DisplayOrder = 2,
                IconName = "file-text",
                CreatedAt = seedDate
            },
            // Diploma
            new DocumentType
            {
                Id = 3,
                Code = "diploma",
                Name_TR = "Diploma (Renkli Fotokopi - PDF)",
                Name_EN = "Diploma (Color Copy - PDF)",
                Name_DE = "Diplom (Farbkopie - PDF)",
                Name_AR = "الدبلوم (نسخة ملونة - PDF)",
                Description_TR = "En son mezun olduğunuz okul diploması",
                Description_EN = "Diploma from your most recent graduation",
                Description_DE = "Diplom Ihres letzten Abschlusses",
                Description_AR = "دبلوم آخر تخرج لك",
                IsRequired = true,
                IsActive = true,
                AllowedFileTypes = ".pdf",
                MaxFileSizeBytes = 10485760, // 10MB
                RequiresApproval = true,
                DisplayOrder = 3,
                IconName = "award",
                CreatedAt = seedDate
            },
            // Transcript
            new DocumentType
            {
                Id = 4,
                Code = "transcript",
                Name_TR = "Transkript / Not Dökümü",
                Name_EN = "Transcript / Grade Report",
                Name_DE = "Zeugnis / Notenübersicht",
                Name_AR = "كشف العلامات",
                Description_TR = "Eğitim sürecinizin not döküm belgesi",
                Description_EN = "Academic transcript of your education",
                Description_DE = "Akademisches Zeugnis Ihrer Ausbildung",
                Description_AR = "كشف الدرجات الأكاديمي لتعليمك",
                IsRequired = false,
                IsActive = true,
                AllowedFileTypes = ".pdf",
                MaxFileSizeBytes = 10485760, // 10MB
                RequiresApproval = true,
                DisplayOrder = 4,
                IconName = "file-spreadsheet",
                CreatedAt = seedDate
            },
            // Language Certificate
            new DocumentType
            {
                Id = 5,
                Code = "language_cert",
                Name_TR = "Dil Sertifikası (Almanca/İngilizce)",
                Name_EN = "Language Certificate (German/English)",
                Name_DE = "Sprachzertifikat (Deutsch/Englisch)",
                Name_AR = "شهادة اللغة (الألمانية / الإنجليزية)",
                Description_TR = "Dil yeterlilik belgeniz (TOEFL, IELTS, TestDaF, vb.)",
                Description_EN = "Language proficiency certificate (TOEFL, IELTS, TestDaF, etc.)",
                Description_DE = "Sprachnachweis (TOEFL, IELTS, TestDaF, usw.)",
                Description_AR = "شهادة الكفاءة اللغوية (TOEFL، IELTS، TestDaF، إلخ)",
                IsRequired = false,
                IsActive = true,
                AllowedFileTypes = ".pdf",
                MaxFileSizeBytes = 10485760, // 10MB
                RequiresApproval = true,
                DisplayOrder = 5,
                IconName = "language",
                CreatedAt = seedDate
            },
            // ID Card
            new DocumentType
            {
                Id = 6,
                Code = "id_card",
                Name_TR = "Kimlik Kartı (Ön-Arka)",
                Name_EN = "ID Card (Front-Back)",
                Name_DE = "Personalausweis (Vorder-Rückseite)",
                Name_AR = "بطاقة الهوية (الأمام والخلف)",
                Description_TR = "Kimlik kartınızın ön ve arka yüzü",
                Description_EN = "Front and back of your ID card",
                Description_DE = "Vorder- und Rückseite Ihres Personalausweises",
                Description_AR = "الجهة الأمامية والخلفية لبطاقة هويتك",
                IsRequired = true,
                IsActive = true,
                AllowedFileTypes = ".pdf,.jpg,.png",
                MaxFileSizeBytes = 5242880, // 5MB
                RequiresApproval = true,
                DisplayOrder = 6,
                IconName = "id-card",
                CreatedAt = seedDate
            },
            // Photo
            new DocumentType
            {
                Id = 7,
                Code = "photo",
                Name_TR = "Biyometrik Fotoğraf",
                Name_EN = "Biometric Photo",
                Name_DE = "Biometrisches Foto",
                Name_AR = "صورة بيومترية",
                Description_TR = "Pasaport formatında güncel fotoğrafınız",
                Description_EN = "Recent photo in passport format",
                Description_DE = "Aktuelles Foto im Passformat",
                Description_AR = "صورة حديثة بتنسيق جواز السفر",
                IsRequired = true,
                IsActive = true,
                AllowedFileTypes = ".jpg,.jpeg,.png",
                MaxFileSizeBytes = 2097152, // 2MB
                RequiresApproval = false,
                DisplayOrder = 7,
                IconName = "camera",
                CreatedAt = seedDate
            }
        );
        
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", NormalizedName = "ADMIN", Description = "System Administrator", CreatedAt = seedDate },
            new Role { Id = 2, Name = "Client", NormalizedName = "CLIENT", Description = "Client User", CreatedAt = seedDate },
            new Role { Id = 3, Name = "Employee", NormalizedName = "EMPLOYEE", Description = "Employee User", CreatedAt = seedDate }
        );
        
        // Seed ApplicationTemplates with multi-language support
        modelBuilder.Entity<ApplicationTemplate>().HasData(
            new ApplicationTemplate
            {
                Id = 1,
                Name_TR = "Denklik İşlem Süreci",
                Name_EN = "Recognition Process",
                Name_DE = "Anerkennungsverfahren",
                Name_AR = "عملية الاعتراف",
                Description_TR = "Diploma denklik işlemleri için standart süreç",
                Description_EN = "Standard process for diploma recognition procedures",
                Description_DE = "Standardverfahren für Diplomanerkennung",
                Description_AR = "العملية القياسية لإجراءات الاعتراف بالدبلوم",
                Type = ApplicationType.Recognition,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 1,
                IconName = "award",
                EstimatedDurationDays = 90,
                MinDurationDays = 60,
                MaxDurationDays = 180,
                CreatedAt = seedDate
            },
            new ApplicationTemplate
            {
                Id = 2,
                Name_TR = "İş Bulma ve Çalışma İzni Süreci",
                Name_EN = "Work Permit Process",
                Name_DE = "Arbeitserlaubnisverfahren",
                Name_AR = "عملية تصريح العمل",
                Description_TR = "İş arama ve çalışma izni başvuru süreci",
                Description_EN = "Job search and work permit application process",
                Description_DE = "Jobsuche und Arbeitserlaubnisantrag",
                Description_AR = "عملية البحث عن عمل وتصريح العمل",
                Type = ApplicationType.WorkPermit,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 2,
                IconName = "briefcase",
                EstimatedDurationDays = 120,
                MinDurationDays = 90,
                MaxDurationDays = 240,
                CreatedAt = seedDate
            },
            new ApplicationTemplate
            {
                Id = 3,
                Name_TR = "Vize İşlem Süreci",
                Name_EN = "Visa Process",
                Name_DE = "Visumverfahren",
                Name_AR = "عملية التأشيرة",
                Description_TR = "Vize başvurusu ve takip süreci",
                Description_EN = "Visa application and tracking process",
                Description_DE = "Visumantrags- und Verfolgungsverfahren",
                Description_AR = "عملية طلب التأشيرة والمتابعة",
                Type = ApplicationType.Visa,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 3,
                IconName = "globe",
                EstimatedDurationDays = 60,
                MinDurationDays = 30,
                MaxDurationDays = 120,
                CreatedAt = seedDate
            },
            new ApplicationTemplate
            {
                Id = 4,
                Name_TR = "Tam Süreç (Hepsi)",
                Name_EN = "Full Process (All)",
                Name_DE = "Vollständiger Prozess (Alle)",
                Name_AR = "العملية الكاملة (الكل)",
                Description_TR = "Denklik, iş izni ve vize işlemlerini içeren tam süreç",
                Description_EN = "Complete process including recognition, work permit and visa procedures",
                Description_DE = "Vollständiger Prozess einschließlich Anerkennung, Arbeitserlaubnis und Visum",
                Description_AR = "العملية الكاملة بما في ذلك الاعتراف وتصريح العمل والتأشيرة",
                Type = ApplicationType.FullProcess,
                IsActive = true,
                IsDefault = true,
                DisplayOrder = 4,
                IconName = "list-checks",
                EstimatedDurationDays = 180,
                MinDurationDays = 120,
                MaxDurationDays = 360,
                CreatedAt = seedDate
            }
        );
        
        // Seed ApplicationStepTemplates with multi-language support
        modelBuilder.Entity<ApplicationStepTemplate>().HasData(
            // Recognition Process Steps
            new ApplicationStepTemplate
            {
                Id = 1,
                ApplicationTemplateId = 1,
                Title_TR = "Denklik İşlemleri",
                Title_EN = "Recognition Procedures",
                Title_DE = "Anerkennungsverfahren",
                Title_AR = "إجراءات الاعتراف",
                Description_TR = "Diploma denklik işlemleri ve onay süreci",
                Description_EN = "Diploma recognition procedures and approval process",
                Description_DE = "Diplomanerkennung und Genehmigungsverfahren",
                Description_AR = "إجراءات الاعتراف بالدبلوم وعملية الموافقة",
                StepOrder = 1,
                IconName = "file-check",
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 90,
                CreatedAt = seedDate
            },
            // Work Permit Process Steps
            new ApplicationStepTemplate
            {
                Id = 2,
                ApplicationTemplateId = 2,
                Title_TR = "İş Bulma ve Çalışma İzni İşlemleri",
                Title_EN = "Work Permit Procedures",
                Title_DE = "Arbeitserlaubnisverfahren",
                Title_AR = "إجراءات تصريح العمل",
                Description_TR = "İş arama ve çalışma izni başvuru süreçleri",
                Description_EN = "Job search and work permit application procedures",
                Description_DE = "Jobsuche und Arbeitserlaubnisantrag",
                Description_AR = "إجراءات البحث عن عمل وتصريح العمل",
                StepOrder = 1,
                IconName = "briefcase",
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 120,
                CreatedAt = seedDate
            },
            // Visa Process Steps
            new ApplicationStepTemplate
            {
                Id = 3,
                ApplicationTemplateId = 3,
                Title_TR = "Vize İşlemleri",
                Title_EN = "Visa Procedures",
                Title_DE = "Visumverfahren",
                Title_AR = "إجراءات التأشيرة",
                Description_TR = "Vize başvurusu ve onay süreci",
                Description_EN = "Visa application and approval process",
                Description_DE = "Visumantrags- und Genehmigungsverfahren",
                Description_AR = "عملية طلب التأشيرة والموافقة",
                StepOrder = 1,
                IconName = "globe",
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 60,
                CreatedAt = seedDate
            },
            // Full Process (Template 4) Steps - Step 1: Recognition
            new ApplicationStepTemplate
            {
                Id = 4,
                ApplicationTemplateId = 4,
                Title_TR = "Denklik İşlemleri",
                Title_EN = "Recognition Procedures",
                Title_DE = "Anerkennungsverfahren",
                Title_AR = "إجراءات الاعتراف",
                Description_TR = "Diploma denklik işlemleri ve onay süreci",
                Description_EN = "Diploma recognition procedures and approval process",
                Description_DE = "Diplomanerkennung und Genehmigungsverfahren",
                Description_AR = "إجراءات الاعتراف بالدبلوم وعملية الموافقة",
                StepOrder = 1,
                IconName = "file-check",
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 90,
                CreatedAt = seedDate
            },
            // Full Process (Template 4) Steps - Step 2: Work Permit
            new ApplicationStepTemplate
            {
                Id = 5,
                ApplicationTemplateId = 4,
                Title_TR = "İş Bulma ve Çalışma İzni İşlemleri",
                Title_EN = "Work Permit Procedures",
                Title_DE = "Arbeitserlaubnisverfahren",
                Title_AR = "إجراءات تصريح العمل",
                Description_TR = "İş arama ve çalışma izni başvuru süreçleri",
                Description_EN = "Job search and work permit application procedures",
                Description_DE = "Jobsuche und Arbeitserlaubnisantrag",
                Description_AR = "إجراءات البحث عن عمل وتصريح العمل",
                StepOrder = 2,
                IconName = "briefcase",
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 120,
                CreatedAt = seedDate
            },
            // Full Process (Template 4) Steps - Step 3: Visa
            new ApplicationStepTemplate
            {
                Id = 6,
                ApplicationTemplateId = 4,
                Title_TR = "Vize İşlemleri",
                Title_EN = "Visa Procedures",
                Title_DE = "Visumverfahren",
                Title_AR = "إجراءات التأشيرة",
                Description_TR = "Vize başvurusu ve onay süreci",
                Description_EN = "Visa application and approval process",
                Description_DE = "Visumantrags- und Genehmigungsverfahren",
                Description_AR = "عملية طلب التأشيرة والموافقة",
                StepOrder = 3,
                IconName = "globe",
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 60,
                CreatedAt = seedDate
            }
        );
        
        // Seed ApplicationSubStepTemplates with multi-language support
        modelBuilder.Entity<ApplicationSubStepTemplate>().HasData(
            // Recognition Process Sub-Steps
            new ApplicationSubStepTemplate
            {
                Id = 1,
                StepTemplateId = 1,
                Name_TR = "Belgeler Yüklendi",
                Name_EN = "Documents Uploaded",
                Name_DE = "Dokumente hochgeladen",
                Name_AR = "تم تحميل المستندات",
                Description_TR = "Gerekli belgeler sisteme yüklendi",
                Description_EN = "Required documents uploaded to system",
                Description_DE = "Erforderliche Dokumente ins System hochgeladen",
                Description_AR = "تم تحميل المستندات المطلوبة إلى النظام",
                SubStepOrder = 1,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 3,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 2,
                StepTemplateId = 1,
                Name_TR = "Denklik Başvurusu Yapıldı",
                Name_EN = "Recognition Application Submitted",
                Name_DE = "Anerkennungsantrag eingereicht",
                Name_AR = "تم تقديم طلب الاعتراف",
                Description_TR = "Denklik başvurusu ilgili kuruma yapıldı",
                Description_EN = "Recognition application submitted to relevant authority",
                Description_DE = "Anerkennungsantrag bei zuständiger Behörde eingereicht",
                Description_AR = "تم تقديم طلب الاعتراف إلى السلطة المختصة",
                SubStepOrder = 2,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 7,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 3,
                StepTemplateId = 1,
                Name_TR = "Denklik Harç Ödemesi Yapıldı",
                Name_EN = "Recognition Fee Paid",
                Name_DE = "Anerkennungsgebühr bezahlt",
                Name_AR = "تم دفع رسوم الاعتراف",
                Description_TR = "Denklik işlem ücreti ödendi",
                Description_EN = "Recognition processing fee paid",
                Description_DE = "Anerkennungsbearbeitungsgebühr bezahlt",
                Description_AR = "تم دفع رسوم معالجة الاعتراف",
                SubStepOrder = 3,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 2,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 4,
                StepTemplateId = 1,
                Name_TR = "Denklik Belgesi Hazır",
                Name_EN = "Recognition Certificate Ready",
                Name_DE = "Anerkennungszertifikat fertig",
                Name_AR = "شهادة الاعتراف جاهزة",
                Description_TR = "Denklik belgesi onaylandı ve hazır",
                Description_EN = "Recognition certificate approved and ready",
                Description_DE = "Anerkennungszertifikat genehmigt und fertig",
                Description_AR = "شهادة الاعتراف معتمدة وجاهزة",
                SubStepOrder = 4,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 78,
                CreatedAt = seedDate
            },
            // Work Permit Process Sub-Steps
            new ApplicationSubStepTemplate
            {
                Id = 5,
                StepTemplateId = 2,
                Name_TR = "İş Arama Sürecinde",
                Name_EN = "In Job Search Process",
                Name_DE = "Im Jobsuchprozess",
                Name_AR = "في عملية البحث عن عمل",
                Description_TR = "Aktif olarak iş aranıyor",
                Description_EN = "Actively searching for employment",
                Description_DE = "Aktive Jobsuche",
                Description_AR = "البحث النشط عن عمل",
                SubStepOrder = 1,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 60,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 6,
                StepTemplateId = 2,
                Name_TR = "İş Teklifi Alındı",
                Name_EN = "Job Offer Received",
                Name_DE = "Stellenangebot erhalten",
                Name_AR = "تم استلام عرض العمل",
                Description_TR = "İşveren tarafından iş teklifi yapıldı",
                Description_EN = "Job offer made by employer",
                Description_DE = "Stellenangebot vom Arbeitgeber",
                Description_AR = "عرض عمل من صاحب العمل",
                SubStepOrder = 2,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 7,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 7,
                StepTemplateId = 2,
                Name_TR = "Çalışma İzni Başvurusu Yapıldı",
                Name_EN = "Work Permit Application Submitted",
                Name_DE = "Arbeitserlaubnisantrag eingereicht",
                Name_AR = "تم تقديم طلب تصريح العمل",
                Description_TR = "Çalışma izni için resmi başvuru yapıldı",
                Description_EN = "Official work permit application submitted",
                Description_DE = "Offizieller Arbeitserlaubnisantrag eingereicht",
                Description_AR = "تم تقديم طلب تصريح العمل الرسمي",
                SubStepOrder = 3,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 45,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 8,
                StepTemplateId = 2,
                Name_TR = "Çalışma İzni Onaylandı",
                Name_EN = "Work Permit Approved",
                Name_DE = "Arbeitserlaubnis genehmigt",
                Name_AR = "تم الموافقة على تصريح العمل",
                Description_TR = "Çalışma izni resmi olarak onaylandı",
                Description_EN = "Work permit officially approved",
                Description_DE = "Arbeitserlaubnis offiziell genehmigt",
                Description_AR = "تم الموافقة رسميًا على تصريح العمل",
                SubStepOrder = 4,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 8,
                CreatedAt = seedDate
            },
            // Visa Process Sub-Steps
            new ApplicationSubStepTemplate
            {
                Id = 9,
                StepTemplateId = 3,
                Name_TR = "Vize Başvuru Belgeler Hazırlandı",
                Name_EN = "Visa Application Documents Prepared",
                Name_DE = "Visumantragsunterlagen vorbereitet",
                Name_AR = "تم إعداد مستندات طلب التأشيرة",
                Description_TR = "Vize başvurusu için gerekli belgeler hazırlandı",
                Description_EN = "Required documents for visa application prepared",
                Description_DE = "Erforderliche Dokumente für Visumantrag vorbereitet",
                Description_AR = "تم إعداد المستندات المطلوبة لطلب التأشيرة",
                SubStepOrder = 1,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 5,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 10,
                StepTemplateId = 3,
                Name_TR = "Vize Başvurusu Yapıldı",
                Name_EN = "Visa Application Submitted",
                Name_DE = "Visumantrag eingereicht",
                Name_AR = "تم تقديم طلب التأشيرة",
                Description_TR = "Vize başvurusu konsolosluğa yapıldı",
                Description_EN = "Visa application submitted to consulate",
                Description_DE = "Visumantrag beim Konsulat eingereicht",
                Description_AR = "تم تقديم طلب التأشيرة إلى القنصلية",
                SubStepOrder = 2,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 35,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 11,
                StepTemplateId = 3,
                Name_TR = "Vize Onaylandı",
                Name_EN = "Visa Approved",
                Name_DE = "Visum genehmigt",
                Name_AR = "تم الموافقة على التأشيرة",
                Description_TR = "Vize başvurusu onaylandı ve hazır",
                Description_EN = "Visa application approved and ready",
                Description_DE = "Visumantrag genehmigt und fertig",
                Description_AR = "تم الموافقة على طلب التأشيرة وجاهزة",
                SubStepOrder = 3,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 20,
                CreatedAt = seedDate
            },
            // Full Process (Template 4) - Step 1 (Recognition) Sub-Steps
            new ApplicationSubStepTemplate
            {
                Id = 13,
                StepTemplateId = 4,
                Name_TR = "Belgeler Yüklendi",
                Name_EN = "Documents Uploaded",
                Name_DE = "Dokumente hochgeladen",
                Name_AR = "تم تحميل المستندات",
                Description_TR = "Gerekli belgeler sisteme yüklendi",
                Description_EN = "Required documents uploaded to system",
                Description_DE = "Erforderliche Dokumente ins System hochgeladen",
                Description_AR = "تم تحميل المستندات المطلوبة إلى النظام",
                SubStepOrder = 1,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 3,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 14,
                StepTemplateId = 4,
                Name_TR = "Denklik Başvurusu Yapıldı",
                Name_EN = "Recognition Application Submitted",
                Name_DE = "Anerkennungsantrag eingereicht",
                Name_AR = "تم تقديم طلب الاعتراف",
                Description_TR = "Denklik başvurusu ilgili kuruma yapıldı",
                Description_EN = "Recognition application submitted to relevant authority",
                Description_DE = "Anerkennungsantrag bei zuständiger Behörde eingereicht",
                Description_AR = "تم تقديم طلب الاعتراف إلى السلطة المختصة",
                SubStepOrder = 2,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 7,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 15,
                StepTemplateId = 4,
                Name_TR = "Denklik Harç Ödemesi Yapıldı",
                Name_EN = "Recognition Fee Paid",
                Name_DE = "Anerkennungsgebühr bezahlt",
                Name_AR = "تم دفع رسوم الاعتراف",
                Description_TR = "Denklik işlem ücreti ödendi",
                Description_EN = "Recognition processing fee paid",
                Description_DE = "Anerkennungsbearbeitungsgebühr bezahlt",
                Description_AR = "تم دفع رسوم معالجة الاعتراف",
                SubStepOrder = 3,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 2,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 16,
                StepTemplateId = 4,
                Name_TR = "Denklik Belgesi Hazır",
                Name_EN = "Recognition Certificate Ready",
                Name_DE = "Anerkennungszertifikat fertig",
                Name_AR = "شهادة الاعتراف جاهزة",
                Description_TR = "Denklik belgesi onaylandı ve hazır",
                Description_EN = "Recognition certificate approved and ready",
                Description_DE = "Anerkennungszertifikat genehmigt und fertig",
                Description_AR = "شهادة الاعتراف معتمدة وجاهزة",
                SubStepOrder = 4,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 78,
                CreatedAt = seedDate
            },
            // Full Process (Template 4) - Step 2 (Work Permit) Sub-Steps
            new ApplicationSubStepTemplate
            {
                Id = 17,
                StepTemplateId = 5,
                Name_TR = "İş Arama Sürecinde",
                Name_EN = "In Job Search Process",
                Name_DE = "Im Jobsuchprozess",
                Name_AR = "في عملية البحث عن عمل",
                Description_TR = "Aktif olarak iş aranıyor",
                Description_EN = "Actively searching for employment",
                Description_DE = "Aktive Jobsuche",
                Description_AR = "البحث النشط عن عمل",
                SubStepOrder = 1,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 60,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 18,
                StepTemplateId = 5,
                Name_TR = "İş Teklifi Alındı",
                Name_EN = "Job Offer Received",
                Name_DE = "Stellenangebot erhalten",
                Name_AR = "تم استلام عرض العمل",
                Description_TR = "İşveren tarafından iş teklifi yapıldı",
                Description_EN = "Job offer made by employer",
                Description_DE = "Stellenangebot vom Arbeitgeber",
                Description_AR = "عرض عمل من صاحب العمل",
                SubStepOrder = 2,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 7,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 19,
                StepTemplateId = 5,
                Name_TR = "Çalışma İzni Başvurusu Yapıldı",
                Name_EN = "Work Permit Application Submitted",
                Name_DE = "Arbeitserlaubnisantrag eingereicht",
                Name_AR = "تم تقديم طلب تصريح العمل",
                Description_TR = "Çalışma izni için resmi başvuru yapıldı",
                Description_EN = "Official work permit application submitted",
                Description_DE = "Offizieller Arbeitserlaubnisantrag eingereicht",
                Description_AR = "تم تقديم طلب تصريح العمل الرسمي",
                SubStepOrder = 3,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 45,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 20,
                StepTemplateId = 5,
                Name_TR = "Çalışma İzni Onaylandı",
                Name_EN = "Work Permit Approved",
                Name_DE = "Arbeitserlaubnis genehmigt",
                Name_AR = "تم الموافقة على تصريح العمل",
                Description_TR = "Çalışma izni resmi olarak onaylandı",
                Description_EN = "Work permit officially approved",
                Description_DE = "Arbeitserlaubnis offiziell genehmigt",
                Description_AR = "تم الموافقة رسميًا على تصريح العمل",
                SubStepOrder = 4,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 8,
                CreatedAt = seedDate
            },
            // Full Process (Template 4) - Step 3 (Visa) Sub-Steps
            new ApplicationSubStepTemplate
            {
                Id = 21,
                StepTemplateId = 6,
                Name_TR = "Vize Başvuru Belgeler Hazırlandı",
                Name_EN = "Visa Application Documents Prepared",
                Name_DE = "Visumantragsunterlagen vorbereitet",
                Name_AR = "تم إعداد مستندات طلب التأشيرة",
                Description_TR = "Vize başvurusu için gerekli belgeler hazırlandı",
                Description_EN = "Required documents for visa application prepared",
                Description_DE = "Erforderliche Dokumente für Visumantrag vorbereitet",
                Description_AR = "تم إعداد المستندات المطلوبة لطلب التأشيرة",
                SubStepOrder = 1,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 5,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 22,
                StepTemplateId = 6,
                Name_TR = "Vize Başvurusu Yapıldı",
                Name_EN = "Visa Application Submitted",
                Name_DE = "Visumantrag eingereicht",
                Name_AR = "تم تقديم طلب التأشيرة",
                Description_TR = "Vize başvurusu konsolosluğa yapıldı",
                Description_EN = "Visa application submitted to consulate",
                Description_DE = "Visumantrag beim Konsulat eingereicht",
                Description_AR = "تم تقديم طلب التأشيرة إلى القنصلية",
                SubStepOrder = 2,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 35,
                CreatedAt = seedDate
            },
            new ApplicationSubStepTemplate
            {
                Id = 23,
                StepTemplateId = 6,
                Name_TR = "Vize Onaylandı",
                Name_EN = "Visa Approved",
                Name_DE = "Visum genehmigt",
                Name_AR = "تم الموافقة على التأشيرة",
                Description_TR = "Vize başvurusu onaylandı ve hazır",
                Description_EN = "Visa application approved and ready",
                Description_DE = "Visumantrag genehmigt und fertig",
                Description_AR = "تم الموافقة على طلب التأشيرة وجاهزة",
                SubStepOrder = 3,
                IsRequired = true,
                IsActive = true,
                EstimatedDurationDays = 20,
                CreatedAt = seedDate
            }
        );
        
        // Seed FAQs with multi-language support
        modelBuilder.Entity<FAQ>().HasData(
            new FAQ
            {
                Id = 1,
                Question_TR = "Başvuru süreci ne kadar sürer?",
                Question_EN = "How long does the application process take?",
                Question_DE = "Wie lange dauert der Bewerbungsprozess?",
                Question_AR = "كم من الوقت تستغرق عملية التقديم؟",
                Answer_TR = "Başvuru süreci ortalama 3-6 ay arasında tamamlanır. Süre, başvuru tipine ve gerekli belgelerin eksiksiz sunulmasına bağlı olarak değişebilir.",
                Answer_EN = "The application process typically takes 3-6 months to complete. Duration may vary depending on the application type and complete submission of required documents.",
                Answer_DE = "Der Bewerbungsprozess dauert in der Regel 3-6 Monate. Die Dauer kann je nach Art der Bewerbung und vollständiger Einreichung der erforderlichen Dokumente variieren.",
                Answer_AR = "تستغرق عملية التقديم عادةً 3-6 أشهر حتى تكتمل. قد تختلف المدة اعتمادًا على نوع الطلب والتقديم الكامل للمستندات المطلوبة.",
                Category = FAQCategory.General,
                Tags = "başvuru,süre,process,duration",
                DisplayOrder = 1,
                IsActive = true,
                IsFeatured = true,
                ViewCount = 0,
                HelpfulCount = 0,
                NotHelpfulCount = 0,
                CreatedAt = seedDate,
                PublishedAt = seedDate
            },
            new FAQ
            {
                Id = 2,
                Question_TR = "Hangi belgeleri yüklemem gerekiyor?",
                Question_EN = "Which documents do I need to upload?",
                Question_DE = "Welche Dokumente muss ich hochladen?",
                Question_AR = "ما هي المستندات التي أحتاج لتحميلها؟",
                Answer_TR = "Yüklemeniz gereken belgeler eğitim durumunuza göre değişir. Pasaport, diploma, transkript, CV ve kimlik belgesi temel belgelerdir. Ayrıntılı liste için belge yükleme sayfasını kontrol edin.",
                Answer_EN = "Required documents vary based on your education level. Passport, diploma, transcript, CV and ID document are basic requirements. Check the document upload page for detailed list.",
                Answer_DE = "Die erforderlichen Dokumente variieren je nach Bildungsniveau. Reisepass, Diplom, Zeugnis, Lebenslauf und Ausweisdokument sind grundlegende Anforderungen. Überprüfen Sie die Dokumenten-Upload-Seite für eine detaillierte Liste.",
                Answer_AR = "تختلف المستندات المطلوبة بناءً على مستوى تعليمك. جواز السفر والدبلوم وكشف الدرجات والسيرة الذاتية ووثيقة الهوية هي المتطلبات الأساسية. تحقق من صفحة تحميل المستندات للحصول على قائمة مفصلة.",
                Category = FAQCategory.Documents,
                Tags = "belgeler,documents,yükleme,upload",
                DisplayOrder = 2,
                IsActive = true,
                IsFeatured = true,
                ViewCount = 0,
                HelpfulCount = 0,
                NotHelpfulCount = 0,
                CreatedAt = seedDate,
                PublishedAt = seedDate
            },
            new FAQ
            {
                Id = 3,
                Question_TR = "Başvuru durumumu nasıl takip edebilirim?",
                Question_EN = "How can I track my application status?",
                Question_DE = "Wie kann ich meinen Bewerbungsstatus verfolgen?",
                Question_AR = "كيف يمكنني تتبع حالة طلبي؟",
                Answer_TR = "Dashboard sayfasından başvurunuzun tüm aşamalarını gerçek zamanlı olarak takip edebilirsiniz. Her adımın durumu ve tamamlanma yüzdesi görüntülenir.",
                Answer_EN = "You can track all stages of your application in real-time from the Dashboard page. Status and completion percentage of each step are displayed.",
                Answer_DE = "Sie können alle Phasen Ihrer Bewerbung in Echtzeit von der Dashboard-Seite aus verfolgen. Status und Abschlussgrad jedes Schritts werden angezeigt.",
                Answer_AR = "يمكنك تتبع جميع مراحل طلبك في الوقت الفعلي من صفحة لوحة التحكم. يتم عرض حالة ونسبة إكمال كل خطوة.",
                Category = FAQCategory.Process,
                Tags = "takip,tracking,durum,status",
                DisplayOrder = 3,
                IsActive = true,
                IsFeatured = true,
                ViewCount = 0,
                HelpfulCount = 0,
                NotHelpfulCount = 0,
                CreatedAt = seedDate,
                PublishedAt = seedDate
            },
            new FAQ
            {
                Id = 4,
                Question_TR = "Denklik işlemi nedir?",
                Question_EN = "What is the recognition process?",
                Question_DE = "Was ist der Anerkennungsprozess?",
                Question_AR = "ما هي عملية الاعتراف؟",
                Answer_TR = "Denklik, yurt dışında alınan diploma ve belgelerin Almanya'da tanınması işlemidir. Bu işlem sayesinde mesleğinizi Almanya'da icra edebilirsiniz.",
                Answer_EN = "Recognition is the process of having diplomas and certificates obtained abroad recognized in Germany. This process allows you to practice your profession in Germany.",
                Answer_DE = "Anerkennung ist der Prozess der Anerkennung von im Ausland erworbenen Diplomen und Zertifikaten in Deutschland. Dieser Prozess ermöglicht es Ihnen, Ihren Beruf in Deutschland auszuüben.",
                Answer_AR = "الاعتراف هو عملية الحصول على اعتراف بالدبلومات والشهادات المكتسبة في الخارج في ألمانيا. تتيح لك هذه العملية ممارسة مهنتك في ألمانيا.",
                Category = FAQCategory.Recognition,
                Tags = "denklik,recognition,diploma,anerkennung",
                DisplayOrder = 4,
                IsActive = true,
                IsFeatured = true,
                ViewCount = 0,
                HelpfulCount = 0,
                NotHelpfulCount = 0,
                CreatedAt = seedDate,
                PublishedAt = seedDate
            },
            new FAQ
            {
                Id = 5,
                Question_TR = "Çalışma izni nasıl alınır?",
                Question_EN = "How to get a work permit?",
                Question_DE = "Wie bekomme ich eine Arbeitserlaubnis?",
                Question_AR = "كيفية الحصول على تصريح عمل؟",
                Answer_TR = "Çalışma izni için önce Almanya'da bir işveren bulmalısınız. İşveren sizin için Agentur für Arbeit'a başvuru yapar. Onay sonrası çalışma izniniz düzenlenir.",
                Answer_EN = "To get a work permit, you first need to find an employer in Germany. The employer applies to the Agentur für Arbeit on your behalf. After approval, your work permit is issued.",
                Answer_DE = "Um eine Arbeitserlaubnis zu erhalten, müssen Sie zunächst einen Arbeitgeber in Deutschland finden. Der Arbeitgeber beantragt für Sie bei der Agentur für Arbeit. Nach Genehmigung wird Ihre Arbeitserlaubnis ausgestellt.",
                Answer_AR = "للحصول على تصريح عمل، تحتاج أولاً إلى العثور على صاحب عمل في ألمانيا. يتقدم صاحب العمل نيابة عنك إلى Agentur für Arbeit. بعد الموافقة، يتم إصدار تصريح العمل الخاص بك.",
                Category = FAQCategory.WorkPermit,
                Tags = "çalışma izni,work permit,arbeitserlaubnis,employment",
                DisplayOrder = 5,
                IsActive = true,
                IsFeatured = false,
                ViewCount = 0,
                HelpfulCount = 0,
                NotHelpfulCount = 0,
                CreatedAt = seedDate,
                PublishedAt = seedDate
            }
        );
        
        // Seed Education Types (Multi-language: TR, EN, DE, AR)
        modelBuilder.Entity<EducationType>().HasData(
            new EducationType 
            { 
                Id = 1, 
                Code = "university",
                Name_TR = "Üniversite Mezunu",
                Name_EN = "University Graduate",
                Name_DE = "Hochschulabsolvent",
                Name_AR = "خريج جامعي",
                Description_TR = "Üniversite mezunları için",
                Description_EN = "For university graduates",
                Description_DE = "Für Hochschulabsolventen",
                Description_AR = "لخريجي الجامعات",
                DisplayOrder = 1,
                IconName = "graduation-cap",
                IsActive = true,
                CreatedAt = seedDate 
            },
            new EducationType 
            { 
                Id = 2, 
                Code = "vocational",
                Name_TR = "Meslek Lisesi Mezunu",
                Name_EN = "Vocational School Graduate",
                Name_DE = "Berufsschulabsolvent",
                Name_AR = "خريج مدرسة مهنية",
                Description_TR = "Meslek lisesi mezunları için",
                Description_EN = "For vocational school graduates",
                Description_DE = "Für Berufsschulabsolventen",
                Description_AR = "لخريجي المدارس المهنية",
                DisplayOrder = 2,
                IconName = "briefcase",
                IsActive = true,
                CreatedAt = seedDate 
            },
            new EducationType 
            { 
                Id = 3, 
                Code = "apprenticeship",
                Name_TR = "Kalfalık / Çıraklık",
                Name_EN = "Apprenticeship / Journeyman",
                Name_DE = "Lehre / Gesellenprüfung",
                Name_AR = "تدريب مهني / حرفي",
                Description_TR = "Kalfa veya çırak belgesi olanlar için",
                Description_EN = "For apprentices and journeymen",
                Description_DE = "Für Auszubildende und Gesellen",
                Description_AR = "للمتدربين والحرفيين",
                DisplayOrder = 3,
                IconName = "tools",
                IsActive = true,
                CreatedAt = seedDate 
            }
        );
        
        // Tekstil Module Configurations
        ConfigureTekstilModule(modelBuilder);
    }
    
    private void ConfigureTekstilModule(ModelBuilder modelBuilder)
    {
        // Table names
        modelBuilder.Entity<Language>().ToTable("wixi_Tekstil_Languages");
        modelBuilder.Entity<About>().ToTable("wixi_Tekstil_About");
        modelBuilder.Entity<AboutTranslation>().ToTable("wixi_Tekstil_About_Translations");
        modelBuilder.Entity<Stat>().ToTable("wixi_Tekstil_Stats");
        modelBuilder.Entity<StatTranslation>().ToTable("wixi_Tekstil_Stats_Translations");
        modelBuilder.Entity<ProductCategory>().ToTable("wixi_Tekstil_ProductCategories");
        modelBuilder.Entity<ProductCategoryTranslation>().ToTable("wixi_Tekstil_ProductCategories_Translations");
        modelBuilder.Entity<Product>().ToTable("wixi_Tekstil_Products");
        modelBuilder.Entity<ProductTranslation>().ToTable("wixi_Tekstil_Products_Translations");
        modelBuilder.Entity<ProductImage>().ToTable("wixi_Tekstil_ProductImages");
        modelBuilder.Entity<ProjectCategory>().ToTable("wixi_Tekstil_ProjectCategories");
        modelBuilder.Entity<ProjectCategoryTranslation>().ToTable("wixi_Tekstil_ProjectCategories_Translations");
        modelBuilder.Entity<Project>().ToTable("wixi_Tekstil_Projects");
        modelBuilder.Entity<ProjectTranslation>().ToTable("wixi_Tekstil_Projects_Translations");
        modelBuilder.Entity<ProjectImage>().ToTable("wixi_Tekstil_ProjectImages");
        modelBuilder.Entity<ProjectTag>().ToTable("wixi_Tekstil_ProjectTags");
        modelBuilder.Entity<ContactInfo>().ToTable("wixi_Tekstil_ContactInfo");
        modelBuilder.Entity<ContactInfoTranslation>().ToTable("wixi_Tekstil_ContactInfo_Translations");
        modelBuilder.Entity<ContactSubmission>().ToTable("wixi_Tekstil_ContactSubmissions");
        
        // Language - Code as alternate key for foreign key relationships
        modelBuilder.Entity<Language>()
            .HasIndex(l => l.Code)
            .IsUnique();

        // AboutTranslation - Foreign key to Language.Code
        modelBuilder.Entity<AboutTranslation>()
            .HasOne(at => at.Language)
            .WithMany()
            .HasForeignKey(at => at.LanguageCode)
            .HasPrincipalKey(l => l.Code)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AboutTranslation>()
            .HasIndex(at => new { at.AboutId, at.LanguageCode })
            .IsUnique();

        // StatTranslation
        modelBuilder.Entity<StatTranslation>()
            .HasOne(st => st.Language)
            .WithMany()
            .HasForeignKey(st => st.LanguageCode)
            .HasPrincipalKey(l => l.Code)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StatTranslation>()
            .HasIndex(st => new { st.StatId, st.LanguageCode })
            .IsUnique();

        // ProductCategoryTranslation
        modelBuilder.Entity<ProductCategoryTranslation>()
            .HasOne(pct => pct.Language)
            .WithMany()
            .HasForeignKey(pct => pct.LanguageCode)
            .HasPrincipalKey(l => l.Code)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductCategoryTranslation>()
            .HasIndex(pct => new { pct.CategoryId, pct.LanguageCode })
            .IsUnique();

        // ProductTranslation
        modelBuilder.Entity<ProductTranslation>()
            .HasOne(pt => pt.Language)
            .WithMany()
            .HasForeignKey(pt => pt.LanguageCode)
            .HasPrincipalKey(l => l.Code)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductTranslation>()
            .HasIndex(pt => new { pt.ProductId, pt.LanguageCode })
            .IsUnique();

        // Product - Unique slug
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        // ProjectCategoryTranslation
        modelBuilder.Entity<ProjectCategoryTranslation>()
            .HasOne(pct => pct.Language)
            .WithMany()
            .HasForeignKey(pct => pct.LanguageCode)
            .HasPrincipalKey(l => l.Code)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectCategoryTranslation>()
            .HasIndex(pct => new { pct.CategoryId, pct.LanguageCode })
            .IsUnique();

        // ProjectTranslation
        modelBuilder.Entity<ProjectTranslation>()
            .HasOne(pt => pt.Language)
            .WithMany()
            .HasForeignKey(pt => pt.LanguageCode)
            .HasPrincipalKey(l => l.Code)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTranslation>()
            .HasIndex(pt => new { pt.ProjectId, pt.LanguageCode })
            .IsUnique();

        // Project - Unique slug
        modelBuilder.Entity<Project>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        // ContactInfoTranslation
        modelBuilder.Entity<ContactInfoTranslation>()
            .HasOne(cit => cit.Language)
            .WithMany()
            .HasForeignKey(cit => cit.LanguageCode)
            .HasPrincipalKey(l => l.Code)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ContactInfoTranslation>()
            .HasIndex(cit => new { cit.ContactInfoId, cit.LanguageCode })
            .IsUnique();

        // ContactSubmission - Indexes for performance
        modelBuilder.Entity<ContactSubmission>()
            .HasIndex(cs => cs.Status);

        modelBuilder.Entity<ContactSubmission>()
            .HasIndex(cs => cs.CreatedAt);

        // Seed default languages
        var seedDate = new DateTime(2026, 1, 4, 12, 0, 0, DateTimeKind.Utc);
        
        modelBuilder.Entity<Language>().HasData(
            new Language
            {
                Id = 1,
                Code = "tr",
                Name = "Turkish",
                NativeName = "Türkçe",
                FlagIcon = "🇹🇷",
                IsDefault = true,
                IsActive = true,
                DisplayOrder = 1,
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            },
            new Language
            {
                Id = 2,
                Code = "en",
                Name = "English",
                NativeName = "English",
                FlagIcon = "🇬🇧",
                IsDefault = false,
                IsActive = true,
                DisplayOrder = 2,
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            },
            new Language
            {
                Id = 3,
                Code = "de",
                Name = "German",
                NativeName = "Deutsch",
                FlagIcon = "🇩🇪",
                IsDefault = false,
                IsActive = true,
                DisplayOrder = 3,
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            }
        );
    }
}

