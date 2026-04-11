using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<WixiCoreDbContext>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<WixiRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<WixiUser>>();

        // 1. Roles
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

        // 2. Initial Admin User
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

        // 3. Languages
        if (!await context.Languages.AnyAsync())
        {
            var tr = new WixiLanguage { Code = "tr-TR", Name = "Türkçe", IsDefault = true, FlagCode = "tr" };
            var en = new WixiLanguage { Code = "en-US", Name = "English", IsDefault = false, FlagCode = "us" };
            var de = new WixiLanguage { Code = "de-DE", Name = "Deutsch", IsDefault = false, FlagCode = "de" };
            
            await context.Languages.AddRangeAsync(tr, en, de);
            await context.SaveChangesAsync();
        }

        // 4. Menus (Colored & Localized)
        if (!await context.Menus.AnyAsync())
        {
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null) return;

            var tr = await context.Languages.FirstAsync(l => l.Code == "tr-TR");
            var en = await context.Languages.FirstAsync(l => l.Code == "en-US");

            // Dashboard
            var mDash = new WixiMenu { UserId = adminUser.Id, Path = "/", Icon = "FaTachometerAlt", IconColor = "#3b82f6", SortOrder = 1 };
            mDash.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Gösterge Paneli" });
            mDash.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Dashboard" });

            // Menu Operations
            var mMenu = new WixiMenu { UserId = adminUser.Id, Path = "/admin/menus", Icon = "FaTh", IconColor = "#7c3aed", SortOrder = 2 };
            mMenu.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Menü İşlemleri" });
            mMenu.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Menu Operations" });

            // Logs
            var mLogs = new WixiMenu { UserId = adminUser.Id, Path = "/admin/logs", Icon = "FaListAlt", IconColor = "#f59e0b", SortOrder = 3 };
            mLogs.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Sistem Logları" });
            mLogs.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "System Logs" });

            // Chat Operations
            var mChat = new WixiMenu { UserId = adminUser.Id, Path = "/admin/chat", Icon = "FaComments", IconColor = "#ec4899", SortOrder = 4 };
            mChat.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Chat İşlemleri" });
            mChat.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Chat Operations" });

            // Connected Devices
            var mDev = new WixiMenu { UserId = adminUser.Id, Path = "/admin/devices", Icon = "FaMobileAlt", IconColor = "#10b981", SortOrder = 5 };
            mDev.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Bağlı Cihazlar" });
            mDev.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Connected Devices" });

            // App Settings
            var mSet = new WixiMenu { UserId = adminUser.Id, Path = "/admin/settings", Icon = "FaCog", IconColor = "#6366f1", SortOrder = 6 };
            mSet.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Uygulama Ayarları" });
            mSet.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "App Settings" });

            await context.Menus.AddRangeAsync(mDash, mMenu, mLogs, mChat, mDev, mSet);
            await context.SaveChangesAsync();
        }
    }
}
