using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Modules.Commands.CreateModule;
using Wixi.Modules.Core.Application.Modules.Commands.DeleteModule;
using Wixi.Modules.Core.Application.Modules.Commands.UpdateModule;
using Wixi.Modules.Core.Application.Modules.Queries.GetModules;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers.Core;

[Authorize(Roles = "SuperAdmin,Admin")]
[ApiController]
[Route("api/v1/[controller]")]
public class ModuleController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly WixiCoreDbContext _context;

    public ModuleController(IMediator mediator, WixiCoreDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ModuleDto>>> GetModules()
    {
        return await _mediator.Send(new GetModulesQuery());
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ModuleDto>>> GetPublicModules()
    {
        return await _mediator.Send(new GetModulesQuery { PublicOnly = true });
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateModule([FromBody] CreateModuleCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(id);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateModule([FromBody] UpdateModuleCommand command)
    {
        await _mediator.Send(command);
        return Ok();
    }

    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<bool>> DeleteModule(Guid id)
    {
        Console.WriteLine($"[ModuleController] Deleting module: {id}");
        var result = await _mediator.Send(new DeleteModuleCommand(id));
        return Ok(result);
    }

    [HttpPost("seed-system-menus")]
    public async Task<IActionResult> SeedSystemMenus()
    {
        // 1. Core Modules Seed
        var modules = new[]
        {
            new WixiModule {
                Code = "ecommerce",
                Name = "E-Ticaret Modülü",
                Description = "Gelişmiş satış ve stok yönetimi çözümü.",
                Icon = "FaStore",
                PriceMonthly = 299,
                PriceYearly = 2990,
                ColorAccent = "#3b82f6",
                IsPopular = true,
                FeaturesJson = "[\"Sınırsız Ürün Ekleme\", \"Stok Takibi\", \"Ödeme Entegrasyonu\", \"Müşteri Yönetimi\", \"Detaylı Raporlama\"]"
            },
            new WixiModule {
                Code = "crm",
                Name = "Müşteri Yönetimi (CRM)",
                Description = "Müşteri ilişkilerinizi profesyonelce yönetin.",
                Icon = "FaUsers",
                PriceMonthly = 199,
                PriceYearly = 1990,
                ColorAccent = "#10b981",
                FeaturesJson = "[\"Müşteri Takibi\", \"Görüşme Kayıtları\", \"Satış Hunisi (Pipeline)\", \"Görev Yönetimi\"]"
            },
            new WixiModule {
                Code = "hr",
                Name = "İnsan Kaynakları",
                Description = "Personel ve bordro süreçlerinizi dijitalleştirin.",
                Icon = "FaAddressCard",
                PriceMonthly = 249,
                PriceYearly = 2490,
                ColorAccent = "#f59e0b",
                FeaturesJson = "[\"Personel Kartları\", \"İzin Yönetimi\", \"Performans Takibi\", \"Bordro Ön Hazırlık\"]"
            }
        };

        foreach (var m in modules)
        {
            if (!await _context.Modules.AnyAsync(x => x.Code == m.Code))
            {
                _context.Modules.Add(m);
            }
        }
        await _context.SaveChangesAsync();

        // 2. Fetch Modules for IDs
        var ecommerceModule = await _context.Modules.FirstOrDefaultAsync(m => m.Code == "ecommerce");
        var crmModule = await _context.Modules.FirstOrDefaultAsync(m => m.Code == "crm");

        // 3. Menus Seed
        var langTr = await _context.Languages.FirstOrDefaultAsync(l => l.Code == "tr-TR" || l.Code == "tr");
        var langEn = await _context.Languages.FirstOrDefaultAsync(l => l.Code == "en-US" || l.Code == "en");

        if (langTr == null) return BadRequest("TR language must be seeded first.");

        // Upsert: create or update menu entry and its translations
        async Task AddMenuIfNotExists(Guid moduleId, string path, string trTitle, string enTitle, string icon, string color, int sortOrder = 0, bool visibleToTenant = true)
        {
            var menu = await _context.ModuleMenus
                .Include(m => m.Translations)
                .FirstOrDefaultAsync(m => m.ModuleId == moduleId && m.Path == path);

            if (menu == null)
            {
                menu = new WixiModuleMenu
                {
                    ModuleId = moduleId,
                    Path = path,
                    Icon = icon,
                    IconColor = color,
                    VisibleToTenant = visibleToTenant,
                    SortOrder = sortOrder
                };
                _context.ModuleMenus.Add(menu);
                await _context.SaveChangesAsync();
            }
            else
            {
                menu.Icon = icon;
                menu.IconColor = color;
                menu.SortOrder = sortOrder;
                menu.VisibleToTenant = visibleToTenant;
            }

            // Upsert TR translation
            var trTrans = menu.Translations.FirstOrDefault(t => t.LanguageId == langTr.Id);
            if (trTrans == null)
                _context.ModuleMenuTranslations.Add(new WixiModuleMenuTranslation { ModuleMenuId = menu.Id, LanguageId = langTr.Id, Title = trTitle });
            else
                trTrans.Title = trTitle;

            // Upsert EN translation
            if (langEn != null)
            {
                var enTrans = menu.Translations.FirstOrDefault(t => t.LanguageId == langEn.Id);
                if (enTrans == null)
                    _context.ModuleMenuTranslations.Add(new WixiModuleMenuTranslation { ModuleMenuId = menu.Id, LanguageId = langEn.Id, Title = enTitle });
                else
                    enTrans.Title = enTitle;
            }

            await _context.SaveChangesAsync();
        }

        // Helper: delete a menu entry (first unlinks its children to avoid FK violation)
        async Task RemoveMenuByPath(string path)
        {
            var old = await _context.ModuleMenus.FirstOrDefaultAsync(m => m.Path == path);
            if (old == null) return;
            var children = await _context.ModuleMenus.Where(m => m.ParentId == old.Id).ToListAsync();
            foreach (var child in children) child.ParentId = null;
            if (children.Count > 0) await _context.SaveChangesAsync();
            _context.ModuleMenus.Remove(old);
            await _context.SaveChangesAsync();
        }

        if (ecommerceModule != null)
        {
            // Remove old wrong-path entries
            await RemoveMenuByPath("/tenant/{tenantSlug}/ecommerce/dashboard");
            await RemoveMenuByPath("/tenant/{tenantSlug}/ecommerce/products");
            await RemoveMenuByPath("/tenant/{tenantSlug}/ecommerce/categories");
            await RemoveMenuByPath("/tenant/{tenantSlug}/ecommerce/orders");
            await RemoveMenuByPath("/admin/orders");
            await RemoveMenuByPath("/admin/settings");
            await RemoveMenuByPath("/admin/theme-editor");
            await RemoveMenuByPath("/admin/crm");
            await RemoveMenuByPath("/admin/projects");
            await RemoveMenuByPath("/admin/support");
            await RemoveMenuByPath("/admin/inventory");
            await RemoveMenuByPath("#");

            // ── Yönetim ──────────────────────────────────────────────────
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}",              "Dashboard",           "Dashboard",           "FaTachometerAlt",  "#6366f1", 10);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/orders",       "Siparişler",          "Orders",              "FaShoppingCart",   "#3b82f6", 20);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/customers",    "Müşteriler",          "Customers",           "FaUsers",          "#10b981", 30);

            // ── Katalog ───────────────────────────────────────────────────
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/products",     "Ürünler",             "Products",            "FaBoxOpen",        "#f59e0b", 40);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/categories",   "Kategoriler",         "Categories",          "FaLayerGroup",     "#f59e0b", 50);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/brands",       "Markalar",            "Brands",              "FaTrademark",      "#f59e0b", 60);

            // ── İçerik ────────────────────────────────────────────────────
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/testimonials",         "Yorumlar",              "Testimonials",  "FaStar",          "#8b5cf6", 70);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/promo-banners",        "Promosyon Bannerları",   "Promo Banners", "FaBullhorn",      "#ec4899", 80);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/sliders",              "Slaytlar",              "Sliders",       "FaImages",        "#8b5cf6", 90);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/faq",                  "SSS",                   "FAQ",           "FaQuestionCircle","#06b6d4", 100);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/contact-submissions",  "İletişim Formları",     "Contact Forms", "FaEnvelope",      "#10b981", 110);

            // ── Sistem ────────────────────────────────────────────────────
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/theme-editor", "Tema Editörü",        "Theme Editor",        "FaPaintBrush",     "#94a3b8", 120);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/settings",     "Ayarlar",             "Settings",            "FaCog",            "#94a3b8", 130);
            await AddMenuIfNotExists(ecommerceModule.Id, "/tenant/{tenantSlug}/billing",      "Fatura & Abonelik",   "Billing",             "FaFileInvoiceDollar","#94a3b8", 140);
        }

        if (crmModule != null)
        {
            await AddMenuIfNotExists(crmModule.Id, "/tenant/{tenantSlug}/crm/contacts", "Rehber", "Contacts", "FaAddressBook", "#10b981");
            await AddMenuIfNotExists(crmModule.Id, "/tenant/{tenantSlug}/crm/deals", "Fırsatlar", "Deals", "FaHandshake", "#10b981");
        }

        return Ok("System menus and modules seeded successfully.");
    }
}
