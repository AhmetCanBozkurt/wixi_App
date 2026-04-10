using wixi.Email.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Extensions
{
    public static class EmailServiceExtensions
    {
        public static IServiceCollection AddEmailServices(this IServiceCollection services)
        {
            services.AddScoped<IEmailTemplateService, EmailTemplateService>();
            services.AddScoped<ISmtpSettingsService, SmtpSettingsService>();
            services.AddScoped<IEmailSender, SmtpEmailSender>();
            
            return services;
        }
    }
}

