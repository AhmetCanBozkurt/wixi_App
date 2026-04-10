using wixi.WebAPI.Services;
using wixi.Clients.Interfaces;
using wixi.Documents.Interfaces;
using wixi.Applications.Interfaces;
using wixi.Support.Interfaces;
using wixi.Email.Interfaces;
using wixi.Content.Interfaces;
using wixi.Forms.Interfaces;
using wixi.Appointments.Interfaces;
using wixi.Payments.Interfaces;
using wixi.CVBuilder.Interfaces;
using wixi.Identity.Interfaces;

namespace wixi.WebAPI.Extensions
{
    public static class BusinessServiceExtensions
    {
        public static IServiceCollection AddBusinessServices(this IServiceCollection services)
        {
            // Memory Cache (required for caching services)
            services.AddMemoryCache();

            // Auth Service
            services.AddScoped<wixi.Identity.Interfaces.IAuthService, AuthService>();
            
            // Menu Permission Service
            services.AddScoped<IMenuPermissionService, MenuPermissionService>();
            services.AddScoped<ITablePreferenceService, TablePreferenceService>();
            
            // Audit Logging Service
            services.AddScoped<IAuditLogService, AuditLogService>();

            // Client Services
            services.AddScoped<IClientService, ClientService>();
            services.AddScoped<wixi.Clients.Interfaces.IClientNoteService, ClientNoteService>();

            // Document Services
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
            services.AddScoped<IDocumentService, DocumentService>();
            services.AddScoped<IDocumentReviewService, DocumentReviewService>();
            services.AddScoped<IDocumentAnalysisService, DocumentAnalysisService>();

            // Application Services
            services.AddScoped<IApplicationService, ApplicationService>();

            // Support Services
            services.AddScoped<ISupportService, SupportService>();
            services.AddScoped<INotificationService, NotificationService>();

            // Appointment Services
            services.AddScoped<wixi.Appointments.Interfaces.IAppointmentService, AppointmentService>();

            // Email Services
            services.AddScoped<IEmailTemplateService, EmailTemplateService>();
            services.AddScoped<ISmtpSettingsService, SmtpSettingsService>();
            services.AddScoped<IEmailSender, SmtpEmailSender>();

            // Content Services
            services.AddScoped<IContentService, ContentService>();

            // Form Services
            services.AddScoped<IFormService, FormService>();

            // Payment Services
            services.AddScoped<IPaymentService, PaymentService>();

            // CV Builder Services
            services.AddScoped<ICVBuilderService, wixi.WebAPI.Services.CVBuilderService>();

            // License Services
            services.AddHttpClient<LicenseService>();
            services.AddScoped<ILicenseService, LicenseService>();

            return services;
        }
    }
}

