using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Domain.Enums;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Infrastructure.Services;

public class WebBuilderTenantProvisioner : ITenantProvisioner
{
    private readonly WebBuilderDbContext _db;

    public WebBuilderTenantProvisioner(WebBuilderDbContext db)
    {
        _db = db;
    }

    public string ModuleName => "webbuilder";

    public async Task ProvisionAsync(string tenantId, string connectionString, string databaseName, CancellationToken cancellationToken = default)
    {
        var tid = Guid.Parse(tenantId);

        // Idempotent — tenant için zaten sayfa varsa atla
        if (await _db.CorpPages.IgnoreQueryFilters().AnyAsync(p => p.TenantId == tid, cancellationToken))
            return;

        var now = DateTime.UtcNow;

        var defaultPages = new List<WixiCorpPage>
        {
            new()
            {
                TenantId = tid,
                PageType  = CorpPageType.Home,
                Slug      = "home",
                Title     = "Ana Sayfa",
                IsPublished  = true,
                PublishedAt  = now,
                CreatedByUser = "System",
                LayoutConfigJson = """
                    [
                      {"id":"hero-1","type":"hero","props":{"title":"Hoş Geldiniz","subtitle":"Kurumsal web sitenizi buradan yönetin","buttonText":"İletişime Geçin","buttonLink":"/iletisim","imageUrl":""}},
                      {"id":"features-1","type":"features","props":{"title":"Neden Biz?","items":[{"icon":"FaRocket","title":"Hızlı","desc":"Yüksek performanslı altyapı"},{"icon":"FaShieldAlt","title":"Güvenli","desc":"SSL ve veri şifrelemesi"},{"icon":"FaHeadset","title":"Destek","desc":"7/24 teknik destek"}]}}
                    ]
                    """
            },
            new()
            {
                TenantId = tid,
                PageType  = CorpPageType.About,
                Slug      = "hakkimizda",
                Title     = "Hakkımızda",
                IsPublished  = true,
                PublishedAt  = now,
                CreatedByUser = "System",
                LayoutConfigJson = """
                    [
                      {"id":"text-1","type":"text-image","props":{"title":"Biz Kimiz?","text":"Şirketinizi burada tanıtın. Vizyonunuzu, misyonunuzu ve değerlerinizi paylaşın.","imagePosition":"right","imageUrl":""}}
                    ]
                    """
            },
            new()
            {
                TenantId = tid,
                PageType  = CorpPageType.Contact,
                Slug      = "iletisim",
                Title     = "İletişim",
                IsPublished  = true,
                PublishedAt  = now,
                CreatedByUser = "System",
                LayoutConfigJson = """
                    [
                      {"id":"contact-1","type":"contact-form","props":{"title":"Bize Ulaşın","submitText":"Gönder","successMessage":"Mesajınız alındı, en kısa sürede dönüş yapacağız."}}
                    ]
                    """
            },
            new()
            {
                TenantId = tid,
                PageType  = CorpPageType.Services,
                Slug      = "hizmetler",
                Title     = "Hizmetlerimiz",
                IsPublished  = false,
                CreatedByUser = "System",
                LayoutConfigJson = """
                    [
                      {"id":"services-1","type":"services-grid","props":{"title":"Hizmetlerimiz","items":[]}}
                    ]
                    """
            },
        };

        _db.CorpPages.AddRange(defaultPages);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
