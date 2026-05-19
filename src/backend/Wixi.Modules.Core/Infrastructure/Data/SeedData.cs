using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        Console.WriteLine(">>> INSIDE SeedData.InitializeAsync");
        Log.Information("[DEBUG] SeedData.InitializeAsync started.");
        var context = serviceProvider.GetRequiredService<WixiCoreDbContext>();
        
        // 0. Sync existing TenantAdmin users
        await SyncTenantIdsAsync(context);

        var roleManager = serviceProvider.GetRequiredService<RoleManager<WixiRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<WixiUser>>();

        // 1. Roles
        string[] roleNames = { "SuperAdmin", "Admin", "Normal", "TenantAdmin" };
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

            // Role Management
            var mRole = new WixiMenu { UserId = adminUser.Id, Path = "/admin/roles", Icon = "FaUserShield", IconColor = "#ef4444", SortOrder = 8 };
            mRole.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Rol Yönetimi" });
            mRole.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Role Management" });

            await context.Menus.AddRangeAsync(mDash, mMenu, mLogs, mChat, mDev, mSet, mMail, mRole);
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

            if (adminUser != null && !await context.Menus.AnyAsync(m => m.Path == "/admin/roles"))
            {
                var tr = await context.Languages.FirstAsync(l => l.Code == "tr-TR");
                var en = await context.Languages.FirstAsync(l => l.Code == "en-US");

                var mRole = new WixiMenu { UserId = adminUser.Id, Path = "/admin/roles", Icon = "FaUserShield", IconColor = "#ef4444", SortOrder = 8 };
                mRole.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Rol Yönetimi" });
                mRole.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Role Management" });

                await context.Menus.AddAsync(mRole);
                await context.SaveChangesAsync();
            }
        }

        // 5. Currencies
        if (!await context.Currencies.AnyAsync())
        {
            var tryc = new WixiCurrency { Code = "TRY", Name = "Türk Lirası", NameEn = "Turkish Lira", Symbol = "₺", Unit = 1, IsBase = true, IsTcmbTracked = false, SortOrder = 1 };
            var usd  = new WixiCurrency { Code = "USD", Name = "ABD Doları",  NameEn = "US Dollar",      Symbol = "$", Unit = 1, IsBase = false, IsTcmbTracked = true,  SortOrder = 2 };
            var eur  = new WixiCurrency { Code = "EUR", Name = "Euro",         NameEn = "Euro",            Symbol = "€", Unit = 1, IsBase = false, IsTcmbTracked = true,  SortOrder = 3 };
            var gbp  = new WixiCurrency { Code = "GBP", Name = "İngiliz Sterlini", NameEn = "British Pound", Symbol = "£", Unit = 1, IsBase = false, IsTcmbTracked = true, SortOrder = 4 };

            await context.Currencies.AddRangeAsync(tryc, usd, eur, gbp);
            await context.SaveChangesAsync();
        }

        // 5a. Currency Settings
        if (!await context.CurrencySettings.AnyAsync())
        {
            var settings = new WixiCurrencySetting
            {
                BaseCurrencyCode = "TRY",
                TcmbAutoSyncEnabled = true
            };
            await context.CurrencySettings.AddAsync(settings);
            await context.SaveChangesAsync();
        }

        // 5b. Finance menus
        {
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser != null)
            {
                var tr = await context.Languages.FirstOrDefaultAsync(l => l.Code == "tr-TR");
                var en = await context.Languages.FirstOrDefaultAsync(l => l.Code == "en-US");

                if (tr != null && en != null)
                {
                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/currencies"))
                    {
                        var mCur = new WixiMenu { UserId = adminUser.Id, Path = "/admin/currencies", Icon = "FaDollarSign", IconColor = "#f59e0b", SortOrder = 20 };
                        mCur.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Para Birimleri" });
                        mCur.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Currencies" });
                        await context.Menus.AddAsync(mCur);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/exchange-rates"))
                    {
                        var mRates = new WixiMenu { UserId = adminUser.Id, Path = "/admin/exchange-rates", Icon = "FaExchangeAlt", IconColor = "#f97316", SortOrder = 21 };
                        mRates.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Döviz Kurları" });
                        mRates.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Exchange Rates" });
                        await context.Menus.AddAsync(mRates);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/currency-settings"))
                    {
                        var mCurSet = new WixiMenu { UserId = adminUser.Id, Path = "/admin/currency-settings", Icon = "FaCog", IconColor = "#6366f1", SortOrder = 22 };
                        mCurSet.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Kur Ayarları" });
                        mCurSet.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Currency Settings" });
                        await context.Menus.AddAsync(mCurSet);
                        await context.SaveChangesAsync();
                    }

                    // E-Commerce menus
                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/ecommerce/tenants"))
                    {
                        var mTenants = new WixiMenu { UserId = adminUser.Id, Path = "/admin/ecommerce/tenants", Icon = "FaStore", IconColor = "#8b5cf6", SortOrder = 30 };
                        mTenants.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Mağazalar" });
                        mTenants.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Stores" });
                        await context.Menus.AddAsync(mTenants);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/ecommerce/products"))
                    {
                        var mProducts = new WixiMenu { UserId = adminUser.Id, Path = "/admin/ecommerce/products", Icon = "FaBoxOpen", IconColor = "#0ea5e9", SortOrder = 31 };
                        mProducts.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Ürünler" });
                        mProducts.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Products" });
                        await context.Menus.AddAsync(mProducts);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/ecommerce/categories"))
                    {
                        var mCats = new WixiMenu { UserId = adminUser.Id, Path = "/admin/ecommerce/categories", Icon = "FaTags", IconColor = "#f43f5e", SortOrder = 32 };
                        mCats.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Kategoriler" });
                        mCats.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Categories" });
                        await context.Menus.AddAsync(mCats);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/ecommerce/brands"))
                    {
                        var mBrands = new WixiMenu { UserId = adminUser.Id, Path = "/admin/ecommerce/brands", Icon = "FaAward", IconColor = "#f59e0b", SortOrder = 33 };
                        mBrands.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Markalar" });
                        mBrands.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Brands" });
                        await context.Menus.AddAsync(mBrands);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/db-schema"))
                    {
                        var mSchema = new WixiMenu { UserId = adminUser.Id, Path = "/admin/db-schema", Icon = "FaDatabase", IconColor = "#06b6d4", SortOrder = 40 };
                        mSchema.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Veritabanı Şeması" });
                        mSchema.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Database Schema" });
                        await context.Menus.AddAsync(mSchema);
                        await context.SaveChangesAsync();
                    }
                }
            }
        }

        // 6. Mail Templates
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

            var tenantWelcomeTemplate = new WixiMailTemplate
            {
                Code = "TENANT_WELCOME",
                Subject = "Mağazanız Hazır — Şifrenizi Belirleyin",
                Body = @"<div style=""font-family: sans-serif; padding: 24px; color: #1f2937; max-width: 560px;"">
                            <h2 style=""color: #2563eb; margin-bottom: 4px;"">Hoş Geldiniz!</h2>
                            <p style=""color:#6b7280; margin-top:0;"">{{ storeName }} mağazanız başarıyla oluşturuldu.</p>
                            <p>Mağazanızı yönetmek için aşağıdaki butona tıklayarak şifrenizi belirleyin:</p>
                            <p style=""margin: 24px 0;"">
                                <a href=""{{ resetLink }}"" style=""display:inline-block; padding:12px 28px; background:#2563eb; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:0.95rem;"">Şifremi Belirle ve Giriş Yap</a>
                            </p>
                            <p style=""font-size:0.85em; color:#6b7280;"">Buton çalışmıyorsa bu bağlantıyı tarayıcınıza kopyalayın:</p>
                            <p style=""font-size:0.82em; word-break:break-all; background:#f3f4f6; padding:10px 12px; border-radius:6px; border:1px solid #e5e7eb;"">{{ resetLink }}</p>
                            <hr style=""border:none; border-top:1px solid #e5e7eb; margin:24px 0;""/>
                            <p style=""font-size:0.85em; color:#6b7280;"">Mağaza URL'niz: <strong>{{ tenantSlug }}.wixi.app</strong></p>
                            <p style=""font-size:0.85em; color:#9ca3af;"">Saygılarımızla,<br/><strong>Wixi Ekibi</strong></p>
                        </div>",
                Category = "SaaS, Onboarding",
                IsActive = true
            };

            await context.MailTemplates.AddRangeAsync(welcomeTemplate, resetPasswordTemplate, forgotPasswordTemplate, twoFactorAuthTemplate, tenantWelcomeTemplate);
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

            // Ensure TENANT_WELCOME exists for SaaS onboarding flow
            if (!await context.MailTemplates.AnyAsync(t => t.Code == "TENANT_WELCOME" && !t.IsDeleted))
            {
                context.MailTemplates.Add(new WixiMailTemplate
                {
                    Code = "TENANT_WELCOME",
                    Subject = "Mağazanız Hazır — Şifrenizi Belirleyin",
                    Body = @"<div style=""font-family: sans-serif; padding: 24px; color: #1f2937; max-width: 560px;"">
                            <h2 style=""color: #2563eb; margin-bottom: 4px;"">Hoş Geldiniz!</h2>
                            <p style=""color:#6b7280; margin-top:0;"">{{ storeName }} mağazanız başarıyla oluşturuldu.</p>
                            <p>Mağazanızı yönetmek için aşağıdaki butona tıklayarak şifrenizi belirleyin:</p>
                            <p style=""margin: 24px 0;"">
                                <a href=""{{ resetLink }}"" style=""display:inline-block; padding:12px 28px; background:#2563eb; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:0.95rem;"">Şifremi Belirle ve Giriş Yap</a>
                            </p>
                            <p style=""font-size:0.85em; color:#6b7280;"">Buton çalışmıyorsa bu bağlantıyı tarayıcınıza kopyalayın:</p>
                            <p style=""font-size:0.82em; word-break:break-all; background:#f3f4f6; padding:10px 12px; border-radius:6px; border:1px solid #e5e7eb;"">{{ resetLink }}</p>
                            <hr style=""border:none; border-top:1px solid #e5e7eb; margin:24px 0;""/>
                            <p style=""font-size:0.85em; color:#6b7280;"">Mağaza URL'niz: <strong>{{ tenantSlug }}.wixi.app</strong></p>
                            <p style=""font-size:0.85em; color:#9ca3af;"">Saygılarımızla,<br/><strong>Wixi Ekibi</strong></p>
                        </div>",
                    Category = "SaaS, Onboarding",
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }
        }

        // 7. Subscription Plans
        if (!await context.SubscriptionPlans.AnyAsync(p => !p.IsDeleted))
        {
            var freePlan = new WixiSubscriptionPlan
            {
                Name = "Ücretsiz",
                Code = "free",
                PriceMonthly = 0,
                PriceYearly = 0,
                FeaturesJson = """["100 ürün", "1 kullanıcı", "Temel analitik", "E-posta desteği"]""",
                MaxProducts = 100,
                MaxUsers = 1,
                SortOrder = 1,
                IsActive = true
            };

            var starterPlan = new WixiSubscriptionPlan
            {
                Name = "Starter",
                Code = "starter",
                PriceMonthly = 299,
                PriceYearly = 2990,
                FeaturesJson = """["1.000 ürün", "3 kullanıcı", "Gelişmiş analitik", "Öncelikli destek", "Özel domain", "Stripe ödeme"]""",
                MaxProducts = 1000,
                MaxUsers = 3,
                SortOrder = 2,
                IsActive = true
            };

            var proPlan = new WixiSubscriptionPlan
            {
                Name = "Pro",
                Code = "pro",
                PriceMonthly = 799,
                PriceYearly = 7990,
                FeaturesJson = """["Sınırsız ürün", "10 kullanıcı", "Tam analitik paketi", "7/24 destek", "Çoklu domain", "Stripe + iyzico", "API erişimi", "Beyaz etiket"]""",
                MaxProducts = -1,
                MaxUsers = 10,
                SortOrder = 3,
                IsActive = true
            };

            await context.SubscriptionPlans.AddRangeAsync(freePlan, starterPlan, proPlan);
            await context.SaveChangesAsync();
        }

        // 8. Public Modules (pricing / feature showcase)
        if (!await context.Modules.AnyAsync())
        {
            var ecommerce = new WixiModule
            {
                Code = "ecommerce",
                Name = "E-Ticaret",
                Description = "Tam kapsamlı e-ticaret yönetimi. Ürünler, siparişler, stok ve müşteri yönetimi tek panelde.",
                IsPublic = true,
                PriceMonthly = 0,
                PriceYearly = 0,
                IsPopular = false,
                SortOrder = 1,
                ColorAccent = "#38bdf8",
                FeaturesJson = """["Ürün kataloğu","Stok takibi","Varyant yönetimi","Kategori & marka","Müşteri kayıtları","Sipariş yönetimi"]"""
            };

            var crm = new WixiModule
            {
                Code = "crm",
                Name = "CRM",
                Description = "Müşteri ilişkilerini güçlendirin. Satış süreçlerini izleyin, fırsatları takip edin.",
                IsPublic = true,
                PriceMonthly = 299,
                PriceYearly = 239,
                IsPopular = true,
                SortOrder = 2,
                ColorAccent = "#818cf8",
                FeaturesJson = """["Müşteri profilleri","Satış pipeline (kanban)","İletişim geçmişi","Görev atama","Raporlar & analizler","E-posta entegrasyonu"]"""
            };

            var notes = new WixiModule
            {
                Code = "notes",
                Name = "Notlar & Dokümanlar",
                Description = "Ekibinizle birlikte not alın, döküman hazırlayın ve bilgi bankası oluşturun.",
                IsPublic = true,
                PriceMonthly = 149,
                PriceYearly = 119,
                IsPopular = false,
                SortOrder = 3,
                ColorAccent = "#34d399",
                FeaturesJson = """["Zengin metin editörü","Gerçek zamanlı işbirliği","Etiketleme & arama","Dosya ekleri","Versiyon geçmişi","Şablonlar"]"""
            };

            var tasks = new WixiModule
            {
                Code = "tasks",
                Name = "Görev Takibi",
                Description = "Projelerinizi ve görevlerinizi yönetin. Kanban panolar, sprint'ler ve detaylı raporlar.",
                IsPublic = true,
                PriceMonthly = 199,
                PriceYearly = 159,
                IsPopular = false,
                SortOrder = 4,
                ColorAccent = "#fb923c",
                FeaturesJson = """["Kanban & liste görünümü","Görev atama & son tarih","Sprint yönetimi","Öncelik seviyeleri","İlerleme raporları","Zaman takibi"]"""
            };

            await context.Modules.AddRangeAsync(ecommerce, crm, notes, tasks);
            await context.SaveChangesAsync();
        }

        // 9. Sync existing TenantAdmin users
        await SyncTenantIdsAsync(context);

        // 10. Seed ecommerce module tenant menus (stock & warehouse pages)
        await SeedEcommerceModuleMenusAsync(context);
    }

    private static async Task SeedEcommerceModuleMenusAsync(WixiCoreDbContext context)
    {
        var ecommerceModule = await context.Modules
            .FirstOrDefaultAsync(m => m.Code == "ecommerce" && m.IsActive);
        if (ecommerceModule is null) return;

        var trLang = await context.Languages
            .FirstOrDefaultAsync(l => l.Code == "tr-TR");
        if (trLang is null) return;

        var newMenus = new[]
        {
            new { Path = "/tenant/{tenantSlug}/stock",        Icon = "FaBoxOpen",      Color = "#10b981", Sort = 25, Title = "Stok Yönetimi" },
            new { Path = "/tenant/{tenantSlug}/stock/report", Icon = "FaWarehouse",    Color = "#6366f1", Sort = 26, Title = "Depo Raporu"    },
            new { Path = "/tenant/{tenantSlug}/cari",         Icon = "FaAddressBook",  Color = "#f59e0b", Sort = 27, Title = "Cari Hesaplar"  },
            new { Path = "/tenant/{tenantSlug}/discounts",    Icon = "FaTag",          Color = "#ec4899", Sort = 28, Title = "Kampanyalar"    },
            new { Path = "/tenant/{tenantSlug}/analytics",    Icon = "FaChartBar",     Color = "#3b82f6", Sort = 29, Title = "Analitik"       },
            new { Path = "/tenant/{tenantSlug}/media",        Icon = "FaImages",       Color = "#8b5cf6", Sort = 30, Title = "Medya"          },
        };

        foreach (var def in newMenus)
        {
            if (await context.ModuleMenus.AnyAsync(m => m.Path == def.Path && m.ModuleId == ecommerceModule.Id))
                continue;

            var menu = new WixiModuleMenu
            {
                ModuleId       = ecommerceModule.Id,
                Path           = def.Path,
                Icon           = def.Icon,
                IconColor      = def.Color,
                SortOrder      = def.Sort,
                VisibleToTenant = true,
            };
            menu.Translations.Add(new WixiModuleMenuTranslation
            {
                LanguageId = trLang.Id,
                Title      = def.Title,
            });
            context.ModuleMenus.Add(menu);
        }

        await context.SaveChangesAsync();
    }

    public static async Task SyncTenantIdsAsync(WixiCoreDbContext context)
    {
        Log.Information("[DEBUG] Starting TenantId Synchronization...");
        
        // 1. Sync TenantAdmin users by their owned tenants
        var tenants = await context.Tenants
            .Where(t => t.OwnerUserId != Guid.Empty && !t.IsDeleted)
            .ToListAsync();

        Log.Information("[DEBUG] Found {Count} active tenants.", tenants.Count);

        bool hasChanges = false;
        foreach (var tenant in tenants)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == tenant.OwnerUserId);
            if (user != null)
            {
                if (user.TenantId == null)
                {
                    Log.Information("[DEBUG] Syncing User {Email} to Tenant {Slug}", user.Email, tenant.Slug);
                    user.TenantId = tenant.Id;
                    hasChanges = true;
                }
                else
                {
                    Log.Information("[DEBUG] User {Email} already has TenantId: {TenantId}", user.Email, user.TenantId);
                }
            }
            else
            {
                Log.Information("[DEBUG] Owner User ID {OwnerUserId} not found for Tenant {Slug}", tenant.OwnerUserId, tenant.Slug);
            }
        }

        // 2. Link orphaned "Normal" users to the first available tenant (Healing)
        var firstTenant = tenants.FirstOrDefault();
        if (firstTenant != null)
        {
            var orphanUsers = await context.Users
                .Where(u => u.TenantId == null && u.Email != "admin@wixi.com") // Don't heal master admin
                .ToListAsync();

            foreach (var orphan in orphanUsers)
            {
                Log.Information("[DEBUG] Healing Orphan User {Email} -> Linking to Tenant {Slug}", orphan.Email, firstTenant.Slug);
                orphan.TenantId = firstTenant.Id;
                hasChanges = true;
            }
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
            Log.Information("[DEBUG] TenantId Synchronization completed with changes.");
        }
        else
        {
            Log.Information("[DEBUG] No changes needed for TenantId Synchronization.");
        }
    }
}
