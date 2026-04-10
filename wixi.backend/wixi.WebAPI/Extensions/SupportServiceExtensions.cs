using wixi.Support.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Extensions
{
    public static class SupportServiceExtensions
    {
        public static IServiceCollection AddSupportServices(this IServiceCollection services)
        {
            services.AddScoped<ISupportService, SupportService>();
            services.AddScoped<INotificationService, NotificationService>();
            
            return services;
        }
    }
}

