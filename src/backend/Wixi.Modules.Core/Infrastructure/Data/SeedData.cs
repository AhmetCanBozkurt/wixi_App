using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<WixiRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<WixiUser>>();

        string[] roleNames = { "SuperAdmin", "Admin", "Normal" };

        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new WixiRole 
                { 
                    Name = roleName, 
                    Description = $"System fallback role: {roleName}" 
                });
            }
        }

        var adminEmail = "admin@wixi.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new WixiUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Wixi",
                LastName = "Admin",
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(adminUser, "WixiAdmin2026!");
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "SuperAdmin");
            }
        }
    }
}
