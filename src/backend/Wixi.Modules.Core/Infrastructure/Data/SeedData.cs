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

        // 4. Menus — Full hierarchical structure
        if (!await context.Menus.AnyAsync())
        {
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null) return;

            var tr = await context.Languages.FirstAsync(l => l.Code == "tr-TR");
            var en = await context.Languages.FirstAsync(l => l.Code == "en-US");

            WixiMenu M(string path, string icon, string color, int sort, Guid? parentId = null)
            {
                var m = new WixiMenu { UserId = adminUser.Id, Path = path, Icon = icon, IconColor = color, SortOrder = sort, ParentId = parentId };
                return m;
            }
            void T(WixiMenu m, string titleTr, string titleEn)
            {
                m.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = titleTr });
                m.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = titleEn });
            }

            // ── Root: Dashboard ──────────────────────────────────────────
            var mDash = M("/", "FaTachometerAlt", "#3b82f6", 18);
            T(mDash, "Gösterge Paneli", "Dashboard");
            await context.Menus.AddAsync(mDash);

            // ── Folder: Sistem Tanımlama Kartları ────────────────────────
            var fSistem = M("folder", "FaArrowRight", "#1a9801", 24);
            T(fSistem, "Sistem Tanımlama Kartları", "System Management");
            await context.Menus.AddAsync(fSistem);
            await context.SaveChangesAsync();

            var sistemChildren = new[]
            {
                (Path: "/admin/mailing",   Icon: "FaMailBulk",    Color: "#2563eb", Sort: 3,  Tr: "Mail Yönetimi",    En: "Mail Management"),
                (Path: "/admin/roles",     Icon: "FaUserShield",  Color: "#ef4444", Sort: 4,  Tr: "Rol Yönetimi",     En: "Role Management"),
                (Path: "/admin/users",     Icon: "FaUsers",       Color: "#6366f1", Sort: 5,  Tr: "Kullanıcılar",     En: "Users"),
                (Path: "/admin/modules",   Icon: "FaPuzzlePiece", Color: "#8b5cf6", Sort: 6,  Tr: "Modüller",         En: "Modules"),
                (Path: "/admin/db-schema", Icon: "FaDatabase",    Color: "#06b6d4", Sort: 7,  Tr: "Veritabanı Şeması",En: "Database Schema"),
                (Path: "/admin/languages", Icon: "FaGlobe",       Color: "#0ea5e9", Sort: 8,  Tr: "Diller",           En: "Languages"),
            };
            foreach (var c in sistemChildren)
            {
                var m = M(c.Path, c.Icon, c.Color, c.Sort, fSistem.Id);
                T(m, c.Tr, c.En);
                await context.Menus.AddAsync(m);
            }

            // Sub-folder: Para Birimi Tanımlama (under Sistem Tanımlama Kartları)
            var fCurrency = M("folder", "FaMoneyCheckAlt", "#22c002", 17, fSistem.Id);
            T(fCurrency, "Para Birimi Tanımlama", "Currency Management");
            await context.Menus.AddAsync(fCurrency);
            await context.SaveChangesAsync();

            var currencyChildren = new[]
            {
                (Path: "/admin/currency-settings", Icon: "FaCog",         Color: "#6366f1", Sort: 14, Tr: "Kur Ayarları",   En: "Currency Settings"),
                (Path: "/admin/currencies",        Icon: "FaDollarSign",  Color: "#f59e0b", Sort: 15, Tr: "Para Birimleri", En: "Currencies"),
                (Path: "/admin/exchange-rates",    Icon: "FaExchangeAlt", Color: "#f97316", Sort: 16, Tr: "Döviz Kurları",  En: "Exchange Rates"),
            };
            foreach (var c in currencyChildren)
            {
                var m = M(c.Path, c.Icon, c.Color, c.Sort, fCurrency.Id);
                T(m, c.Tr, c.En);
                await context.Menus.AddAsync(m);
            }

            // ── Folder: Modüller (root) ──────────────────────────────────
            var fModules = M("folder", "FaPuzzlePiece", "#8b5cf6", 25);
            T(fModules, "Modüller", "Modules");
            await context.Menus.AddAsync(fModules);
            await context.SaveChangesAsync();

            // ── Sub-Folder: E-Ticaret (under Modüller) ───────────────────
            var fECommerce = M("folder", "FaArtstation", "#0549b8", 1, fModules.Id);
            T(fECommerce, "E-Ticaret", "E-Commerce");
            await context.Menus.AddAsync(fECommerce);
            await context.SaveChangesAsync();

            var ecommerceChildren = new[]
            {
                (Path: "/admin/theme-management",     Icon: "FaPaintBrush", Color: "#a855f7", Sort: 9,  Tr: "Tema Yönetimi", En: "Theme Management"),
                (Path: "/admin/ecommerce/tenants",    Icon: "FaStore",      Color: "#8b5cf6", Sort: 10, Tr: "Mağazalar",     En: "Stores"),
                (Path: "/admin/ecommerce/products",   Icon: "FaBoxOpen",    Color: "#0ea5e9", Sort: 11, Tr: "Ürünler",       En: "Products"),
                (Path: "/admin/ecommerce/categories", Icon: "FaTags",       Color: "#f43f5e", Sort: 12, Tr: "Kategoriler",   En: "Categories"),
                (Path: "/admin/ecommerce/brands",     Icon: "FaAward",      Color: "#f59e0b", Sort: 13, Tr: "Markalar",      En: "Brands"),
            };
            foreach (var c in ecommerceChildren)
            {
                var m = M(c.Path, c.Icon, c.Color, c.Sort, fECommerce.Id);
                T(m, c.Tr, c.En);
                await context.Menus.AddAsync(m);
            }

            // ── Sub-Folder: Web Builder (under Modüller) ─────────────────
            var fWebBuilder = M("folder", "FaGlobe", "#06b6d4", 2, fModules.Id);
            T(fWebBuilder, "Web Builder", "Web Builder");
            await context.Menus.AddAsync(fWebBuilder);
            await context.SaveChangesAsync();

            var webBuilderChildren = new[]
            {
                (Path: "/corp/builder",     Icon: "FaEdit",      Color: "#06b6d4", Sort: 10, Tr: "Web Builder Editörü", En: "Web Builder Editor"),
                (Path: "/admin/corp/blog",  Icon: "FaNewspaper", Color: "#10b981", Sort: 20, Tr: "Blog Yönetimi",       En: "Blog Management"),
                (Path: "/admin/corp/forms", Icon: "FaWpforms",   Color: "#f59e0b", Sort: 30, Tr: "Form Yönetimi",       En: "Form Management"),
            };
            foreach (var c in webBuilderChildren)
            {
                var m = M(c.Path, c.Icon, c.Color, c.Sort, fWebBuilder.Id);
                T(m, c.Tr, c.En);
                await context.Menus.AddAsync(m);
            }

            // ── Folder: Log Yönetimi ─────────────────────────────────────
            var fLogs = M("folder", "FaBacon", "#3b82f6", 26);
            T(fLogs, "Log Yönetimi", "Log Management");
            await context.Menus.AddAsync(fLogs);
            await context.SaveChangesAsync();

            var logChildren = new[]
            {
                (Path: "/admin/audit", Icon: "FaClipboardList", Color: "#f59e0b", Sort: 1, Tr: "Denetim Günlüğü", En: "Audit Log"),
                (Path: "/admin/logs",  Icon: "FaListAlt",       Color: "#f59e0b", Sort: 2, Tr: "Sistem Logları",  En: "System Logs"),
            };
            foreach (var c in logChildren)
            {
                var m = M(c.Path, c.Icon, c.Color, c.Sort, fLogs.Id);
                T(m, c.Tr, c.En);
                await context.Menus.AddAsync(m);
            }

            // ── Root: Standalone items ───────────────────────────────────
            var rootItems = new[]
            {
                (Path: "/admin/crm",       Icon: "FaHandshake",      Color: "#10b981", Sort: 19, Tr: "CRM",       En: "CRM"),
                (Path: "/admin/visits",    Icon: "FaCalendarCheck",  Color: "#f43f5e", Sort: 20, Tr: "Ziyaretler", En: "Visits"),
                (Path: "/admin/projects",  Icon: "FaProjectDiagram", Color: "#3b82f6", Sort: 21, Tr: "Projeler",   En: "Projects"),
                (Path: "/admin/support",   Icon: "FaHeadset",        Color: "#ec4899", Sort: 22, Tr: "Destek",     En: "Support"),
                (Path: "/admin/inventory", Icon: "FaWarehouse",      Color: "#78716c", Sort: 23, Tr: "Envanter",   En: "Inventory"),
            };
            foreach (var c in rootItems)
            {
                var m = M(c.Path, c.Icon, c.Color, c.Sort);
                T(m, c.Tr, c.En);
                await context.Menus.AddAsync(m);
            }

            await context.SaveChangesAsync();
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

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/users"))
                    {
                        var mUsers = new WixiMenu { UserId = adminUser.Id, Path = "/admin/users", Icon = "FaUsers", IconColor = "#6366f1", SortOrder = 11 };
                        mUsers.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Kullanıcılar" });
                        mUsers.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Users" });
                        await context.Menus.AddAsync(mUsers);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/languages"))
                    {
                        var mLang = new WixiMenu { UserId = adminUser.Id, Path = "/admin/languages", Icon = "FaGlobe", IconColor = "#0ea5e9", SortOrder = 12 };
                        mLang.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Diller" });
                        mLang.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Languages" });
                        await context.Menus.AddAsync(mLang);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/modules"))
                    {
                        var mMod = new WixiMenu { UserId = adminUser.Id, Path = "/admin/modules", Icon = "FaPuzzlePiece", IconColor = "#8b5cf6", SortOrder = 13 };
                        mMod.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Modüller" });
                        mMod.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Modules" });
                        await context.Menus.AddAsync(mMod);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/audit"))
                    {
                        var mAudit = new WixiMenu { UserId = adminUser.Id, Path = "/admin/audit", Icon = "FaClipboardList", IconColor = "#f59e0b", SortOrder = 9 };
                        mAudit.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Denetim Günlüğü" });
                        mAudit.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Audit Log" });
                        await context.Menus.AddAsync(mAudit);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/crm"))
                    {
                        var mCrm = new WixiMenu { UserId = adminUser.Id, Path = "/admin/crm", Icon = "FaHandshake", IconColor = "#10b981", SortOrder = 50 };
                        mCrm.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "CRM" });
                        mCrm.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "CRM" });
                        await context.Menus.AddAsync(mCrm);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/visits"))
                    {
                        var mVisits = new WixiMenu { UserId = adminUser.Id, Path = "/admin/visits", Icon = "FaCalendarCheck", IconColor = "#f43f5e", SortOrder = 51 };
                        mVisits.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Ziyaretler" });
                        mVisits.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Visits" });
                        await context.Menus.AddAsync(mVisits);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/projects"))
                    {
                        var mProj = new WixiMenu { UserId = adminUser.Id, Path = "/admin/projects", Icon = "FaProjectDiagram", IconColor = "#3b82f6", SortOrder = 52 };
                        mProj.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Projeler" });
                        mProj.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Projects" });
                        await context.Menus.AddAsync(mProj);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/support"))
                    {
                        var mSupport = new WixiMenu { UserId = adminUser.Id, Path = "/admin/support", Icon = "FaHeadset", IconColor = "#ec4899", SortOrder = 53 };
                        mSupport.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Destek" });
                        mSupport.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Support" });
                        await context.Menus.AddAsync(mSupport);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/inventory"))
                    {
                        var mInv = new WixiMenu { UserId = adminUser.Id, Path = "/admin/inventory", Icon = "FaWarehouse", IconColor = "#78716c", SortOrder = 54 };
                        mInv.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Envanter" });
                        mInv.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Inventory" });
                        await context.Menus.AddAsync(mInv);
                        await context.SaveChangesAsync();
                    }

                    if (!await context.Menus.AnyAsync(m => m.Path == "/admin/theme-management"))
                    {
                        var mTheme = new WixiMenu { UserId = adminUser.Id, Path = "/admin/theme-management", Icon = "FaPaintBrush", IconColor = "#a855f7", SortOrder = 55 };
                        mTheme.Translations.Add(new WixiMenuTranslation { LanguageId = tr.Id, Title = "Tema Yönetimi" });
                        mTheme.Translations.Add(new WixiMenuTranslation { LanguageId = en.Id, Title = "Theme Management" });
                        await context.Menus.AddAsync(mTheme);
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
                PriceMonthly = 499,
                PriceYearly = 399,
                IsPopular = true,
                SortOrder = 1,
                ColorAccent = "#38bdf8",
                Category = "satis",
                Tag = "popular",
                FeaturesJson = """["Ürün kataloğu","Stok takibi","Varyant yönetimi","Kategori & marka","Müşteri kayıtları","Sipariş yönetimi"]"""
            };

            var crm = new WixiModule
            {
                Code = "crm",
                Name = "CRM",
                Description = "Müşteri ilişkilerini güçlendirin. Satış süreçlerini izleyin, fırsatları takip edin.",
                IsPublic = true,
                PriceMonthly = 399,
                PriceYearly = 319,
                IsPopular = true,
                SortOrder = 2,
                ColorAccent = "#818cf8",
                Category = "satis",
                Tag = "popular",
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
                Category = "verim",
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
                Category = "verim",
                FeaturesJson = """["Kanban & liste görünümü","Görev atama & son tarih","Sprint yönetimi","Öncelik seviyeleri","İlerleme raporları","Zaman takibi"]"""
            };

            var webbuilder = new WixiModule
            {
                Code = "webbuilder",
                Name = "Kurumsal Web Site",
                Description = "Şirketinizin kurumsal web sitesini kolayca oluşturun ve yönetin. Sürükle-bırak sayfa editörü.",
                IsPublic = true,
                PriceMonthly = 249,
                PriceYearly = 199,
                IsPopular = false,
                SortOrder = 5,
                ColorAccent = "#0ea5e9",
                Category = "satis",
                Tag = "new",
                FeaturesJson = """["Sürükle-bırak editör","Ana sayfa & hakkımızda","Hizmetler sayfası","İletişim formu","SEO ayarları","Özel domain desteği"]"""
            };

            var core = new WixiModule
            {
                Code = "core",
                Name = "Core",
                Description = "Platform temel modülü — her tenant için dahildir.",
                IsPublic = false,
                SortOrder = 0,
                ColorAccent = "#6366f1"
            };

            await context.Modules.AddRangeAsync(core, ecommerce, crm, notes, tasks, webbuilder);
            await context.SaveChangesAsync();
        }

        // 9. Sync existing TenantAdmin users
        await SyncTenantIdsAsync(context);

        // 10. Seed module tenant menus
        await SeedEcommerceModuleMenusAsync(context);
        await SeedCoreModuleMenusAsync(context);
    }

    private static async Task SeedEcommerceModuleMenusAsync(WixiCoreDbContext context)
    {
        var trLang = await context.Languages.FirstOrDefaultAsync(l => l.Code == "tr-TR");
        var enLang = await context.Languages.FirstOrDefaultAsync(l => l.Code == "en-US");
        if (trLang is null) return;

        // ── E-Commerce module menus ──────────────────────────────────────
        var ecommerce = await context.Modules.FirstOrDefaultAsync(m => m.Code == "ecommerce" && m.IsActive);
        if (ecommerce is not null)
        {
            var ecomMenus = new[]
            {
                new { Path = "/tenant/{tenantSlug}",                  Icon = "FaTachometerAlt",     Color = "#6366f1", Sort = 10,  Tr = "Gösterge Paneli",       En = "Dashboard"            },
                new { Path = "/tenant/{tenantSlug}/orders",           Icon = "FaShoppingCart",      Color = "#3b82f6", Sort = 20,  Tr = "Siparişler",            En = "Orders"               },
                new { Path = "/tenant/{tenantSlug}/customers",        Icon = "FaUsers",             Color = "#10b981", Sort = 30,  Tr = "Müşteriler",            En = "Customers"            },
                new { Path = "/tenant/{tenantSlug}/products",         Icon = "FaBoxOpen",           Color = "#f59e0b", Sort = 40,  Tr = "Ürünler",               En = "Products"             },
                new { Path = "/tenant/{tenantSlug}/categories",       Icon = "FaLayerGroup",        Color = "#f59e0b", Sort = 50,  Tr = "Kategoriler",           En = "Categories"           },
                new { Path = "/tenant/{tenantSlug}/brands",           Icon = "FaTrademark",         Color = "#f59e0b", Sort = 60,  Tr = "Markalar",              En = "Brands"               },
                new { Path = "/tenant/{tenantSlug}/testimonials",     Icon = "FaStar",              Color = "#8b5cf6", Sort = 70,  Tr = "Yorumlar",              En = "Testimonials"         },
                new { Path = "/tenant/{tenantSlug}/promo-banners",    Icon = "FaBullhorn",          Color = "#ec4899", Sort = 80,  Tr = "Promosyon Bannerları",  En = "Promo Banners"        },
                new { Path = "/tenant/{tenantSlug}/sliders",          Icon = "FaImages",            Color = "#8b5cf6", Sort = 90,  Tr = "Sliderlar",             En = "Sliders"              },
                new { Path = "/tenant/{tenantSlug}/faq",              Icon = "FaQuestionCircle",    Color = "#06b6d4", Sort = 100, Tr = "SSS",                   En = "FAQ"                  },
                new { Path = "/tenant/{tenantSlug}/contact-submissions", Icon = "FaEnvelope",       Color = "#10b981", Sort = 110, Tr = "İletişim Talepleri",    En = "Contact Submissions"  },
                new { Path = "/tenant/{tenantSlug}/theme-editor",     Icon = "FaPaintBrush",        Color = "#94a3b8", Sort = 120, Tr = "Tema Editörü",          En = "Theme Editor"         },
                new { Path = "/tenant/{tenantSlug}/settings",         Icon = "FaCog",               Color = "#94a3b8", Sort = 130, Tr = "Ayarlar",               En = "Settings"             },
                new { Path = "/tenant/{tenantSlug}/billing",          Icon = "FaFileInvoiceDollar", Color = "#94a3b8", Sort = 140, Tr = "Faturalama",            En = "Billing"              },
                new { Path = "/tenant/{tenantSlug}/stock",            Icon = "FaBoxOpen",           Color = "#10b981", Sort = 25,  Tr = "Stok Yönetimi",         En = "Stock Management"     },
                new { Path = "/tenant/{tenantSlug}/stock/report",     Icon = "FaWarehouse",         Color = "#6366f1", Sort = 26,  Tr = "Depo Raporu",           En = "Warehouse Report"     },
                new { Path = "/tenant/{tenantSlug}/cari",             Icon = "FaAddressBook",       Color = "#f59e0b", Sort = 27,  Tr = "Cari Hesaplar",         En = "Accounts"             },
                new { Path = "/tenant/{tenantSlug}/discounts",        Icon = "FaTag",               Color = "#ec4899", Sort = 28,  Tr = "Kampanyalar",           En = "Discounts"            },
                new { Path = "/tenant/{tenantSlug}/analytics",        Icon = "FaChartBar",          Color = "#3b82f6", Sort = 29,  Tr = "Analitik",              En = "Analytics"            },
                new { Path = "/tenant/{tenantSlug}/media",            Icon = "FaImages",            Color = "#8b5cf6", Sort = 30,  Tr = "Medya",                 En = "Media"                },
            };

            foreach (var def in ecomMenus)
            {
                if (await context.ModuleMenus.AnyAsync(m => m.Path == def.Path && m.ModuleId == ecommerce.Id))
                    continue;

                var menu = new WixiModuleMenu
                {
                    ModuleId        = ecommerce.Id,
                    Path            = def.Path,
                    Icon            = def.Icon,
                    IconColor       = def.Color,
                    SortOrder       = def.Sort,
                    VisibleToTenant = true,
                };
                menu.Translations.Add(new WixiModuleMenuTranslation { LanguageId = trLang.Id, Title = def.Tr });
                if (enLang is not null)
                    menu.Translations.Add(new WixiModuleMenuTranslation { LanguageId = enLang.Id, Title = def.En });
                context.ModuleMenus.Add(menu);
            }
        }

        // ── CRM module menus ─────────────────────────────────────────────
        var crm = await context.Modules.FirstOrDefaultAsync(m => m.Code == "crm" && m.IsActive);
        if (crm is not null)
        {
            var crmMenus = new[]
            {
                new { Path = "/tenant/{tenantSlug}/crm/contacts", Icon = "FaAddressBook", Color = "#10b981", Sort = 10, Tr = "Kişiler",  En = "Contacts" },
                new { Path = "/tenant/{tenantSlug}/crm/deals",    Icon = "FaHandshake",   Color = "#10b981", Sort = 20, Tr = "Fırsatlar", En = "Deals"    },
            };

            foreach (var def in crmMenus)
            {
                if (await context.ModuleMenus.AnyAsync(m => m.Path == def.Path && m.ModuleId == crm.Id))
                    continue;

                var menu = new WixiModuleMenu
                {
                    ModuleId        = crm.Id,
                    Path            = def.Path,
                    Icon            = def.Icon,
                    IconColor       = def.Color,
                    SortOrder       = def.Sort,
                    VisibleToTenant = true,
                };
                menu.Translations.Add(new WixiModuleMenuTranslation { LanguageId = trLang.Id, Title = def.Tr });
                if (enLang is not null)
                    menu.Translations.Add(new WixiModuleMenuTranslation { LanguageId = enLang.Id, Title = def.En });
                context.ModuleMenus.Add(menu);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedCoreModuleMenusAsync(WixiCoreDbContext context)
    {
        var trLang = await context.Languages.FirstOrDefaultAsync(l => l.Code == "tr-TR");
        var enLang = await context.Languages.FirstOrDefaultAsync(l => l.Code == "en-US");
        if (trLang is null) return;

        var core = await context.Modules.FirstOrDefaultAsync(m => m.Code == "core" && m.IsActive);
        if (core is null) return;

        var coreMenus = new[]
        {
            new { Path = "/tenant/{tenantSlug}/payment-settings", Icon = "FaCreditCard", Color = "#10b981", Sort = 150, Tr = "Ödeme Entegrasyonu", En = "Payment Settings" },
            new { Path = "/tenant/{tenantSlug}/payments",         Icon = "FaHistory",    Color = "#3b82f6", Sort = 160, Tr = "Ödeme Geçmişi",      En = "Payment History"  },
        };

        foreach (var def in coreMenus)
        {
            if (await context.ModuleMenus.AnyAsync(m => m.Path == def.Path && m.ModuleId == core.Id))
                continue;

            var menu = new WixiModuleMenu
            {
                ModuleId        = core.Id,
                Path            = def.Path,
                Icon            = def.Icon,
                IconColor       = def.Color,
                SortOrder       = def.Sort,
                VisibleToTenant = true,
            };
            menu.Translations.Add(new WixiModuleMenuTranslation { LanguageId = trLang.Id, Title = def.Tr });
            if (enLang is not null)
                menu.Translations.Add(new WixiModuleMenuTranslation { LanguageId = enLang.Id, Title = def.En });
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
