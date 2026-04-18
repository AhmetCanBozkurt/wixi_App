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

            // Mail Operations
            var mMail = new WixiMenu { UserId = adminUser.Id, Path = "/admin/mailing", Icon = "FaMailBulk", IconColor = "#2563eb", SortOrder = 7 };
            mMail.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Mail Yönetimi" });
            mMail.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Mail Management" });

            await context.Menus.AddRangeAsync(mDash, mMenu, mLogs, mChat, mDev, mSet, mMail);
            await context.SaveChangesAsync();
        }
        else
        {
            // Ensure Mailing menu exists even if other menus are present
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser != null && !await context.Menus.AnyAsync(m => m.Path == "/admin/mailing"))
            {
                var tr = await context.Languages.FirstAsync(l => l.Code == "tr-TR");
                var en = await context.Languages.FirstAsync(l => l.Code == "en-US");

                var mMail = new WixiMenu { UserId = adminUser.Id, Path = "/admin/mailing", Icon = "FaMailBulk", IconColor = "#2563eb", SortOrder = 7 };
                mMail.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Mail Yönetimi" });
                mMail.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Mail Management" });

                await context.Menus.AddAsync(mMail);
                await context.SaveChangesAsync();
            }
        }

        // 5. Mail Templates
        if (!await context.MailTemplates.AnyAsync())
        {
            var welcomeTemplate = new WixiMailTemplate
            {
                Code = "WELCOME_EMAIL",
                Subject = "Wixi'ye Hoş Geldiniz! 🚀",
                Body = @"<div style=""font-family: sans-serif; padding: 20px; color: #333;"">
                            <h2 style=""color: #2563eb;"">Merhaba {{ fullName }},</h2>
                            <p>Wixi platformuna hoş geldiniz. Hesabınız başarıyla oluşturulmuştur.</p>
                            <p>Giriş e-posta adresiniz: <strong>{{ email }}</strong></p>
                            <p>Platformumuzu güvenle ve keyifle kullanmanızı dileriz.</p>
                            <br/>
                            <p style=""font-size: 0.9em; color: #666;"">Saygılarımızla,<br/><strong>Wixi Ekibi</strong></p>
                        </div>",
                Category = "System, Auth",
                IsActive = true
            };

            var resetPasswordTemplate = new WixiMailTemplate
            {
                Code = "PASSWORD_RESET",
                Subject = "Wixi Şifre Sıfırlama Talebi",
                Body = @"<div style=""font-family: sans-serif; padding: 20px; color: #333;"">
                            <h2>Merhaba {{ fullName }},</h2>
                            <p>Hesabınız için bir şifre sıfırlama talebi aldık.</p>
                            <p>Şifrenizi güvenli bir şekilde sıfırlamak için lütfen aşağıdaki butona tıklayın:</p>
                            <p style=""margin: 20px 0;"">
                                <a href=""{{ resetLink }}"" style=""display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;"">Şifremi Sıfırla</a>
                            </p>
                            <p style=""font-size: 0.9em; color: #666;"">Buton çalışmıyorsa bu linki kopyalayıp tarayıcıya yapıştırın:</p>
                            <p style=""font-size: 0.9em; word-break: break-all;""><a href=""{{ resetLink }}"" style=""color:#2563eb;"">{{ resetLinkText ?? resetLink }}</a></p>
                            <p style=""font-size: 0.9em; color: #666;"">Eğer bu talebi siz yapmadıysanız, hesabınız güvendedir ve bu e-postayı dikkate almayabilirsiniz.</p>
                            <br/>
                            <p style=""font-size: 0.9em; color: #666;"">Saygılarımızla,<br/><strong>Wixi Ekibi</strong></p>
                        </div>",
                Category = "Auth",
                IsActive = true
            };

            // Alias template for plan compatibility
            var forgotPasswordTemplate = new WixiMailTemplate
            {
                Code = "FORGOT_PASSWORD",
                Subject = resetPasswordTemplate.Subject,
                Body = resetPasswordTemplate.Body,
                Category = "Auth",
                IsActive = true
            };

            var twoFactorAuthTemplate = new WixiMailTemplate
            {
                Code = "TWO_FACTOR_AUTH",
                Subject = "Wixi İki Aşamalı Doğrulama (2FA) Kodunuz",
                Body = @"<div style=""font-family: sans-serif; padding: 20px; color: #333;"">
                            <h2>Merhaba {{ fullName }},</h2>
                            <p>Hesabınıza giriş yapmak için güvenlik kodunuz oluşturulmuştur. Lütfen aşağıdaki tek kullanımlık kodu doğrulama ekranına girin:</p>
                            <div style=""margin: 20px 0; text-align: center;"">
                                <h1 style=""letter-spacing: 8px; color: #10b981; background: #f0fdf4; padding: 20px; border-radius: 8px; display: inline-block; border: 1px solid #bbf7d0; margin: 0;"">{{ code }}</h1>
                            </div>
                            <p style=""color: #ef4444; font-size: 0.9em;""><strong>Dikkat:</strong> Bu kod 5 dakika boyunca geçerlidir. Güvenliğiniz için bu kodu şirket çalışanları dahil kimseyle paylaşmayınız.</p>
                            <br/>
                            <p style=""font-size: 0.9em; color: #666;"">Saygılarımızla,<br/><strong>Wixi Ekibi</strong></p>
                        </div>",
                Category = "Auth, Security",
                IsActive = true
            };

            await context.MailTemplates.AddRangeAsync(welcomeTemplate, resetPasswordTemplate, forgotPasswordTemplate, twoFactorAuthTemplate);
            await context.SaveChangesAsync();
        }
        else
        {
            // Ensure FORGOT_PASSWORD exists even if templates were already seeded earlier
            var hasForgot = await context.MailTemplates.AnyAsync(t => t.Code == "FORGOT_PASSWORD" && !t.IsDeleted);
            if (!hasForgot)
            {
                var reset = await context.MailTemplates.FirstOrDefaultAsync(t => t.Code == "PASSWORD_RESET" && !t.IsDeleted);
                if (reset != null)
                {
                    context.MailTemplates.Add(new WixiMailTemplate
                    {
                        Code = "FORGOT_PASSWORD",
                        Subject = reset.Subject,
                        Body = reset.Body,
                        Category = reset.Category ?? "Auth",
                        IsActive = true,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    });
                    await context.SaveChangesAsync();
                }
            }

            // Ensure reset templates contain a copyable plain link line (some clients disable styled buttons)
            var templatesToFix = await context.MailTemplates
                .Where(t => (t.Code == "PASSWORD_RESET" || t.Code == "FORGOT_PASSWORD") && !t.IsDeleted)
                .ToListAsync();

            foreach (var t in templatesToFix)
            {
                // If it already contains a plain visible URL, skip
                if (t.Body.Contains("Kopyalayıp tarayıcıya", StringComparison.OrdinalIgnoreCase) &&
                    (t.Body.Contains("{{ resetLink }}", StringComparison.OrdinalIgnoreCase) || t.Body.Contains("{{resetLink}}", StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                // Append a plain link section before the "Eğer bu talebi siz yapmadıysanız" line if possible.
                var marker = "Eğer bu talebi siz yapmadıysanız";
                var insertHtml =
                    @"<p style=""font-size: 0.9em; color: #666;"">Buton tıklanamazsa linki kopyalayıp tarayıcıya yapıştırın:</p>
<p style=""font-size: 0.9em; word-break: break-all; margin: 6px 0;"">
  <a href=""{{ resetLink }}"" style=""color:#2563eb;"">{{ resetLink }}</a>
</p>
<p style=""font-size: 0.85em; color:#111827; word-break: break-all; background:#f3f4f6; padding:10px 12px; border-radius:8px; border:1px solid #e5e7eb;"">
  {{ resetLink }}
</p>";

                var idx = t.Body.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                if (idx >= 0)
                {
                    t.Body = t.Body.Insert(idx, insertHtml + Environment.NewLine);
                }
                else
                {
                    t.Body += Environment.NewLine + insertHtml;
                }

                t.UpdatedAt = DateTime.UtcNow;
            }

            if (templatesToFix.Count > 0)
            {
                await context.SaveChangesAsync();
            }
        }
    }
}
