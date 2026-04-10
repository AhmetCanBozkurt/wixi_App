using wixi.Clients.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Extensions
{
    public static class ClientServiceExtensions
    {
        public static IServiceCollection AddClientServices(this IServiceCollection services)
        {
            services.AddScoped<IClientService, ClientService>();
            
            return services;
        }
    }
}

