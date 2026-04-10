using wixi.Tekstil.Interfaces;
using wixi.WebAPI.Services.Tekstil;

namespace wixi.WebAPI.Extensions
{
    public static class TekstilServiceExtensions
    {
        public static IServiceCollection AddTekstilServices(this IServiceCollection services)
        {
            services.AddScoped<ILanguageService, LanguageService>();
            services.AddScoped<IAboutService, AboutService>();
            services.AddScoped<IStatsService, StatsService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<IContactService, ContactService>();

            return services;
        }
    }
}

