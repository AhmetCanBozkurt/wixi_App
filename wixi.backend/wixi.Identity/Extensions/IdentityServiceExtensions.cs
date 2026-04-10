using Microsoft.Extensions.DependencyInjection;
using wixi.Identity.Interfaces;
using wixi.Identity.Services;

namespace wixi.Identity.Extensions;

public static class IdentityServiceExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services)
    {
        // Register Identity services (no DbContext dependencies)
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}


