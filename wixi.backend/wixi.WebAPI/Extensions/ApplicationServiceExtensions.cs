using wixi.Applications.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IApplicationService, ApplicationService>();
            
            return services;
        }
    }
}

