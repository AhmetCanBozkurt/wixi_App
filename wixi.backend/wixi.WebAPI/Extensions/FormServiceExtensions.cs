using wixi.Forms.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Extensions
{
    public static class FormServiceExtensions
    {
        public static IServiceCollection AddFormServices(this IServiceCollection services)
        {
            services.AddScoped<IFormService, FormService>();
            
            return services;
        }
    }
}

