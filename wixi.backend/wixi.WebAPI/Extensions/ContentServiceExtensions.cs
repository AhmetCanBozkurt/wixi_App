using wixi.Content.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Extensions
{
    public static class ContentServiceExtensions
    {
        public static IServiceCollection AddContentServices(this IServiceCollection services)
        {
            services.AddScoped<IContentService, ContentService>();
            
            return services;
        }
    }
}

