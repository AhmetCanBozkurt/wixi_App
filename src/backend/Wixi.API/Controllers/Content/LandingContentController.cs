using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Landing.Commands.SubmitContact;
using Wixi.Modules.Core.Application.Landing.Commands.VoteRoadmapItem;
using Wixi.Modules.Core.Application.Landing.Queries.GetPublicAbout;
using Wixi.Modules.Core.Application.Landing.Queries.GetPublicCases;
using Wixi.Modules.Core.Application.Landing.Queries.GetPublicFaq;
using Wixi.Modules.Core.Application.Landing.Queries.GetPublicRoadmap;
using Wixi.Modules.Core.Application.Landing.Queries.GetPublicStats;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers.Content;

[ApiController]
[Route("api/v1/landing")]
public class LandingContentController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly WixiCoreDbContext _db;

    public LandingContentController(IMediator mediator, WixiCoreDbContext db)
    {
        _mediator = mediator;
        _db = db;
    }

    [HttpGet("faq/public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFaq([FromQuery] string lang = "tr", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetPublicFaqQuery(lang), ct);
        return Ok(result);
    }

    [HttpGet("stats/public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStats([FromQuery] string lang = "tr", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetPublicStatsQuery(lang), ct);
        return Ok(result);
    }

    [HttpPost("contact")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitContact([FromBody] SubmitContactCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpGet("about/public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAbout([FromQuery] string lang = "tr", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetPublicAboutQuery(lang), ct);
        return Ok(result);
    }

    [HttpGet("cases/public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCases(
        [FromQuery] string lang = "tr",
        [FromQuery] string? industry = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetPublicCasesQuery(lang, industry), ct);
        return Ok(result);
    }

    [HttpGet("roadmap/public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRoadmap([FromQuery] string lang = "tr", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetPublicRoadmapQuery(lang), ct);
        return Ok(result);
    }

    [HttpPost("roadmap/{id}/vote")]
    [AllowAnonymous]
    public async Task<IActionResult> VoteRoadmap(
        Guid id,
        [FromBody] VoteRoadmapRequest request,
        CancellationToken ct)
    {
        var ipHash = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _mediator.Send(new VoteRoadmapItemCommand(id, request.SessionToken, ipHash), ct);
        return Ok(new { voteCount = result });
    }

    [HttpGet("legal/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLegal(string slug, [FromQuery] string lang = "tr", CancellationToken ct = default)
    {
        var doc = await _db.LegalDocuments
            .Include(d => d.Translations).ThenInclude(t => t.Language)
            .Where(d => d.Slug == slug && d.IsActive && !d.IsDeleted)
            .OrderByDescending(d => d.EffectiveDate)
            .FirstOrDefaultAsync(ct);
        if (doc == null) return NotFound();
        var translation = doc.Translations
            .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))
            ?? doc.Translations.FirstOrDefault();
        return Ok(new {
            slug = doc.Slug,
            version = doc.Version,
            effectiveDate = doc.EffectiveDate.ToString("yyyy-MM-dd"),
            title = translation?.Title ?? slug,
            contentHtml = translation?.ContentHtml ?? ""
        });
    }

    [HttpPost("seed")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> SeedLandingContent(CancellationToken ct)
    {
        var db = _db;
        var trLang = await db.Languages.FirstOrDefaultAsync(l => l.Code.StartsWith("tr"), ct);
        var enLang = await db.Languages.FirstOrDefaultAsync(l => l.Code.StartsWith("en"), ct);

        if (trLang == null)
            return BadRequest("TR language bulunamadı. Önce dil seed edin.");

        if (!await db.PlatformStats.AnyAsync(ct))
        {
            var statDefs = new[]
            {
                (Key: "active_tenants",     Value: "1.250+", Tr: "Aktif İşletme",   En: "Active Businesses", Order: 1),
                (Key: "total_transactions", Value: "4.5M+",  Tr: "İşlem",           En: "Transactions",      Order: 2),
                (Key: "uptime",             Value: "%99.9",  Tr: "Uptime",          En: "Uptime",             Order: 3),
                (Key: "satisfaction",       Value: "4.9★",   Tr: "Memnuniyet",      En: "Satisfaction",      Order: 4),
            };

            foreach (var def in statDefs)
            {
                var stat = new WixiPlatformStat
                {
                    StatKey = def.Key,
                    DisplayValue = def.Value,
                    SortOrder = def.Order
                };
                db.PlatformStats.Add(stat);
                db.PlatformStatTranslations.Add(new WixiPlatformStatTranslation
                    { StatId = stat.Id, LanguageId = trLang.Id, Label = def.Tr });
                if (enLang != null)
                    db.PlatformStatTranslations.Add(new WixiPlatformStatTranslation
                        { StatId = stat.Id, LanguageId = enLang.Id, Label = def.En });
            }

            await db.SaveChangesAsync(ct);
        }

        if (!await db.FaqCategories.AnyAsync(ct))
        {
            var catDefs = new[]
            {
                (Slug: "genel",         Tr: "Genel",         En: "General",     Order: 1),
                (Slug: "fiyatlandirma", Tr: "Fiyatlandırma", En: "Pricing",     Order: 2),
                (Slug: "teknik",        Tr: "Teknik",        En: "Technical",   Order: 3),
                (Slug: "guvenlik",      Tr: "Güvenlik",      En: "Security",    Order: 4),
                (Slug: "entegrasyon",   Tr: "Entegrasyon",   En: "Integration", Order: 5),
            };

            var catMap = new Dictionary<string, WixiFaqCategory>();
            foreach (var def in catDefs)
            {
                var cat = new WixiFaqCategory { Slug = def.Slug, SortOrder = def.Order };
                db.FaqCategories.Add(cat);
                db.FaqCategoryTranslations.Add(new WixiFaqCategoryTranslation
                    { CategoryId = cat.Id, LanguageId = trLang.Id, Label = def.Tr });
                if (enLang != null)
                    db.FaqCategoryTranslations.Add(new WixiFaqCategoryTranslation
                        { CategoryId = cat.Id, LanguageId = enLang.Id, Label = def.En });
                catMap[def.Slug] = cat;
            }
            await db.SaveChangesAsync(ct);

            var faqDefs = new[]
            {
                (Slug: "genel",         Q: "Wixi nedir?",                              A: "Wixi, KOBİ'ler için geliştirilmiş modüler bir SaaS platformudur. E-ticaret, CRM, İK, stok, destek ve daha fazlasını tek bir panelde yönetmenizi sağlar.",    Order: 1),
                (Slug: "genel",         Q: "Ücretsiz deneme süresi var mı?",           A: "Evet, tüm yeni hesaplar 14 günlük tam özellikli ücretsiz deneme alır. Kredi kartı gerekmez.",                                                                  Order: 2),
                (Slug: "genel",         Q: "Birden fazla şube yönetebilir miyim?",     A: "Evet, Wixi çok lokasyonlu işletmeler için tasarlanmıştır. Premium ve Kurumsal planlarda sınırsız şube tanımlayabilirsiniz.",                                    Order: 3),
                (Slug: "fiyatlandirma", Q: "Fiyatlandırma nasıl işliyor?",            A: "Kullandığınız modüllere göre aylık veya yıllık abonelik ödüyorsunuz. Yıllık abonelikte 2 ay ücretsiz avantajı elde edersiniz.",                                 Order: 1),
                (Slug: "fiyatlandirma", Q: "İptal etmek kolay mı?",                   A: "Evet, istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde mevcut dönem sonuna kadar erişiminiz devam eder.",                                               Order: 2),
                (Slug: "fiyatlandirma", Q: "Gizli ücret var mı?",                     A: "Hayır. Abonelik ücretine ek olarak herhangi bir kurulum, bakım veya eklenti ücreti yoktur.",                                                                   Order: 3),
                (Slug: "teknik",        Q: "Verilerimi taşıyabilir miyim?",            A: "Evet, CSV/Excel formatında her zaman veri export edebilirsiniz. Ayrıca başka platformlardan import desteğimiz mevcuttur.",                                     Order: 1),
                (Slug: "teknik",        Q: "API desteği var mı?",                     A: "Evet, tüm modüller REST API ile entegre edilebilir. Kurumsal planda tam API erişimi ve webhook desteği bulunur.",                                               Order: 2),
                (Slug: "guvenlik",      Q: "Verilerim güvende mi?",                   A: "Tüm veriler Türkiye'deki ISO 27001 sertifikalı veri merkezlerinde tutulur. TLS 1.3 şifreli iletim ve AES-256 depolama şifrelemesi kullanılır.",                 Order: 1),
                (Slug: "guvenlik",      Q: "KVKK uyumlu mu?",                         A: "Evet, Wixi KVKK ve GDPR gerekliliklerine tam uyumludur. Veri işleme sözleşmesi (DPA) taleple sağlanır.",                                                       Order: 2),
                (Slug: "entegrasyon",   Q: "Hangi kargo firmalarıyla entegrasyon var?",A: "Yurtiçi Kargo, MNG, Aras, PTT, HepsiJET ve Sürat Kargo ile entegrasyonumuz bulunmaktadır.",                                                                   Order: 1),
                (Slug: "entegrasyon",   Q: "Muhasebe programıyla bağlantı kurabilir miyim?", A: "Logo, Mikro ve Luca ile direkt entegrasyon mevcuttur. Diğer programlar için CSV export/import veya API kullanılabilir.",                                 Order: 2),
            };

            foreach (var def in faqDefs)
            {
                var cat = catMap[def.Slug];
                var faq = new WixiFaq { CategoryId = cat.Id, SortOrder = def.Order };
                db.Faqs.Add(faq);
                db.FaqTranslations.Add(new WixiFaqTranslation
                    { FaqId = faq.Id, LanguageId = trLang.Id, Question = def.Q, Answer = def.A });
            }
            await db.SaveChangesAsync(ct);
        }

        // Wave 2 seeds

        if (!await db.TeamMembers.AnyAsync(ct))
        {
            var members = new[]
            {
                ("Ahmet Yılmaz",   "AY", "#6366f1", "Kurucu & CEO",              "Founder & CEO",             "Yönetim",     "Management",    1),
                ("Elif Kaya",      "EK", "#8b5cf6", "Kurucu & CTO",              "Co-Founder & CTO",          "Mühendislik", "Engineering",   2),
                ("Mert Demir",     "MD", "#3b82f6", "Ürün Müdürü",               "Product Manager",           "Ürün",        "Product",       3),
                ("Selin Arslan",   "SA", "#10b981", "Baş Tasarımcı",             "Head of Design",            "Tasarım",     "Design",        4),
                ("Can Öztürk",    "CÖ", "#f59e0b", "Kıdemli Backend Geliştirici","Senior Backend Dev",        "Mühendislik", "Engineering",   5),
                ("Zeynep Çelik",  "ZÇ", "#ec4899", "Frontend Geliştirici",      "Frontend Developer",        "Mühendislik", "Engineering",   6),
                ("Burak Şahin",   "BŞ", "#06b6d4", "DevOps Mühendisi",          "DevOps Engineer",           "Altyapı",     "Infrastructure",7),
                ("Ayşe Yıldız",   "AY", "#8b5cf6", "Müşteri Başarı Uzmanı",     "Customer Success Manager",  "Destek",      "Support",       8),
                ("Emre Güven",    "EG", "#3b82f6", "Satış Yöneticisi",          "Sales Manager",             "Satış",       "Sales",         9),
                ("Hande Kılıç",   "HK", "#10b981", "İçerik & Pazarlama",        "Content & Marketing",       "Pazarlama",   "Marketing",    10),
                ("Fatih Erdoğan", "FE", "#6366f1", "QA Mühendisi",              "QA Engineer",               "Mühendislik", "Engineering",  11),
            };

            foreach (var (name, initials, color, roleTr, roleEn, deptTr, deptEn, order) in members)
            {
                var m = new WixiTeamMember
                {
                    FullName = name,
                    Initials = initials,
                    AvatarColor = color,
                    SortOrder = order
                };
                db.TeamMembers.Add(m);
                db.TeamMemberTranslations.Add(new WixiTeamMemberTranslation
                    { MemberId = m.Id, LanguageId = trLang.Id, Role = roleTr, Department = deptTr });
                if (enLang != null)
                    db.TeamMemberTranslations.Add(new WixiTeamMemberTranslation
                        { MemberId = m.Id, LanguageId = enLang.Id, Role = roleEn, Department = deptEn });
            }
            await db.SaveChangesAsync(ct);
        }

        if (!await db.CompanyMilestones.AnyAsync(ct))
        {
            var milestones = new[]
            {
                ((short)2022, "Wixi kuruldu",                  "Wixi founded",                1),
                ((short)2023, "İlk 100 müşteri",               "First 100 customers",         2),
                ((short)2024, "E-Ticaret modülü yayında",      "E-Commerce module launched",  3),
                ((short)2024, "Tohum finansman turu",           "Seed funding round",          4),
                ((short)2025, "1.000 aktif mağaza",            "1,000 active stores",         5),
                ((short)2026, "Wixi Stüdyo ve AI özellikleri", "Wixi Studio and AI features", 6),
            };

            foreach (var (year, titleTr, titleEn, order) in milestones)
            {
                var ms = new WixiCompanyMilestone { Year = year, SortOrder = order };
                db.CompanyMilestones.Add(ms);
                db.CompanyMilestoneTranslations.Add(new WixiCompanyMilestoneTranslation
                    { MilestoneId = ms.Id, LanguageId = trLang.Id, Title = titleTr });
                if (enLang != null)
                    db.CompanyMilestoneTranslations.Add(new WixiCompanyMilestoneTranslation
                        { MilestoneId = ms.Id, LanguageId = enLang.Id, Title = titleEn });
            }
            await db.SaveChangesAsync(ct);
        }

        if (!await db.CaseStudies.AnyAsync(ct))
        {
            var cases = new[]
            {
                ("kuzey-kahve",    "KK", "food",        "%108",   "₺248K",    true,  "Kuzey Kahve",     "Bir butik kahveci nasıl 3 ay içinde sipariş hacmini ikiye katladı?", "15 yıllık geleneksel kafe işletmecisi, pandemi sonrası dönüşüm için Wixi'yi tercih etti.", "Sipariş artışı", "Aylık ciro", "Wixi sayesinde online satışa geçişimiz 2 günde tamamlandı.", "Ahmet Yılmaz · Kuzey Kahve", 1),
                ("nora-tekstil",   "NT", "textile",     "%142",   "−6sa/gün", false, "NoraTekstil",     "Stok kaosu yerine senkron çalışan 4 mağaza",                        "4 fiziksel + 2 online satış kanalı arasında stok senkronizasyonu Wixi ile günde 1 saatten 0'a indi.", "Stok doğruluğu", "Manuel iş azalması", null, null, 2),
                ("anadolu-bakery", "AB", "food",        "5→1",    "₺18K/ay",  false, "Anadolu Bakery",  "5 şubeli zincir, tek panel",                                        "Şube müdürleri kendi gün sonu raporlarını Wixi'den hazırlıyor.", "Yazılım azaltma", "Aylık tasarruf", null, null, 3),
                ("sefa-optik",     "SO", "retail",      "%62",    "3.2x",     false, "Sefa Optik",      "CRM ile müşteri sadakati %62 arttı",                                "Reçete yenileme hatırlatmaları otomatize edildi.", "Sadakat artışı", "Tekrar satın alma", null, null, 4),
                ("mimoza-studio",  "MS", "service",     "8x",     "%95",      false, "Mimoza Studio",   "1 kişiden 8 kişiye büyüyen tasarım stüdyosu",                       "Proje takibi, müşteri faturalandırma ve İK Wixi'de.", "Ekip büyümesi", "Vaktinde teslim", null, null, 5),
                ("atlas-spor",     "AT", "manufacture", "−72sa",  "%18",      false, "Atlas Spor",      "Üretimden ödemeye uçtan uca dijital",                               "Sipariş geldiği anda iş emri otomatik çıkıyor.", "Sipariş döngüsü", "Hata azalması", null, null, 6),
                ("levanten-cafe",  "LC", "food",        "%38",    "0 kod",    false, "Levanten Cafe",   "Stüdyo modülü ile online rezervasyon",                              "Stüdyo'dan oluşturulan rezervasyon formu CRM ile entegre çalışıyor.", "Doluluk artışı", "Entegrasyon", null, null, 7),
            };

            foreach (var (slug, initials, industry, m1v, m2v, featured, clientName, title, desc, m1l, m2l, quote, quoteAuthor, order) in cases)
            {
                var cs = new WixiCaseStudy
                {
                    ClientSlug = slug,
                    ClientInitials = initials,
                    Industry = industry,
                    Metric1Value = m1v,
                    Metric2Value = m2v,
                    IsFeatured = featured,
                    SortOrder = order
                };
                db.CaseStudies.Add(cs);
                db.CaseStudyTranslations.Add(new WixiCaseStudyTranslation
                {
                    CaseStudyId = cs.Id,
                    LanguageId = trLang.Id,
                    ClientName = clientName,
                    Title = title,
                    Description = desc,
                    Metric1Label = m1l,
                    Metric2Label = m2l,
                    QuoteText = quote,
                    QuoteAuthor = quoteAuthor
                });
            }
            await db.SaveChangesAsync(ct);
        }

        if (!await db.RoadmapItems.AnyAsync(ct))
        {
            var items = new[]
            {
                ("shipped", "Q4 2025", "Yeni Modül", "15 Mayıs 2026",      0,    true,  "Stüdyo Modülü",       "Sürükle-bırak form + akış builder, AI form üretici, 30+ component.", 1),
                ("shipped", "Q4 2025", "Platform",   "Mart 2026",          0,    true,  "Mobil Yönetici App",  "iOS + Android, sipariş yönetimi, push bildirim.",                     2),
                ("shipped", "Q4 2025", "Lokalizasyon","Şubat 2026",        0,    true,  "Çok Dilli Yönetim",  "12 dilde mağaza yönetimi, otomatik çeviri.",                          3),
                ("now",     "Q1 2026", "Yeni Modül", "Beklenen: Mayıs 2026",847, false, "Muhasebe Modülü",    "E-fatura, gelir-gider, KDV beyannamesi, GİB entegrasyonu.",          4),
                ("now",     "Q1 2026", "Geliştirici","Beklenen: Haziran 2026",423,false,"API Marketplace",    "3. parti geliştiriciler için modül marketplace.",                     5),
                ("now",     "Q1 2026", "Yeni Modül", "Beklenen: Haziran 2026",312,false,"Çağrı Merkezi Beta", "VoIP, IVR, çağrı kayıtları.",                                        6),
                ("next",    "Q2 2026", "Yeni Modül", "Q3 2026",            568,  false, "Üretim Modülü",      "İş emri, BOM, kalite kontrol.",                                      7),
                ("next",    "Q2 2026", "AI",         "Q3 2026",            1200, false, "AI Asistan",         "Panelinize özel sohbet asistanı.",                                   8),
                ("next",    "Q2 2026", "Finans",     "Q3 2026",            289,  false, "KOBİ Kredi Modülü",  "Bankalar ile entegre kredi başvuru.",                                9),
                ("next",    "Q2 2026", "Kurumsal",   "Q3 2026",            178,  false, "White-label",        "Tam markalama, kendi domainde sunum.",                               10),
                ("later",   "2026+",   "Donanım",    "2027",               92,   false, "Mağaza POS",         "Fiziksel mağaza için Wixi-uyumlu POS terminali.",                    11),
                ("later",   "2026+",   "Eğitim",     "2027",               156,  false, "Wixi Akademi",       "KOBİ sahipleri için ücretsiz online eğitim platformu.",              12),
                ("later",   "2026+",   "Pazarlama",  "2027",               64,   false, "Marketplace Listesi","Wixi mağazalarının sergilendiği marka pazaryeri.",                   13),
            };

            foreach (var (phase, phaseLabel, cat, date, votes, shipped, title, desc, order) in items)
            {
                var ri = new WixiRoadmapItem
                {
                    Phase = phase,
                    PhaseLabel = phaseLabel,
                    Category = cat,
                    PlannedDate = date,
                    VoteCount = votes,
                    IsShipped = shipped,
                    SortOrder = order
                };
                db.RoadmapItems.Add(ri);
                db.RoadmapItemTranslations.Add(new WixiRoadmapItemTranslation
                    { ItemId = ri.Id, LanguageId = trLang.Id, Title = title, Description = desc });
            }
            await db.SaveChangesAsync(ct);
        }

        if (!await db.ChangelogEntries.AnyAsync(ct))
        {
            var entries = new[]
            {
                ("v2.8.0", new DateOnly(2026, 5,  1), "feature",     "Stüdyo AI Form Üretici",           "Türkçe açıklama ile saniyeler içinde hazır form oluşturun.",                            1),
                ("v2.7.5", new DateOnly(2026, 4, 15), "improvement", "Kargo Entegrasyonu Genişletildi",  "HepsiJET ve UPS Türkiye API entegrasyonu eklendi.",                                     2),
                ("v2.7.2", new DateOnly(2026, 4,  1), "improvement", "Dashboard Hız Optimizasyonu",      "Ana panel yüklenme süresi ortalama %40 azaltıldı.",                                     3),
                ("v2.7.0", new DateOnly(2026, 3,  1), "feature",     "Mobil Yönetici App v1.0",          "iOS ve Android için Wixi Yönetici uygulaması yayınlandı.",                              4),
                ("v2.6.8", new DateOnly(2026, 3, 10), "fix",         "E-fatura Yazdırma Hatası Düzeltildi","Bazı tarayıcılarda PDF e-fatura görüntülemede boş sayfa sorunu giderildi.",           5),
            };

            foreach (var (version, date, tag, title, desc, order) in entries)
            {
                var e = new WixiChangelogEntry
                {
                    Version = version,
                    ReleaseDate = date,
                    Tag = tag,
                    SortOrder = order
                };
                db.ChangelogEntries.Add(e);
                db.ChangelogTranslations.Add(new WixiChangelogTranslation
                    { EntryId = e.Id, LanguageId = trLang.Id, Title = title, Description = desc });
            }
            await db.SaveChangesAsync(ct);
        }

        // --- Module seed (Category + Tag alanlarını doldur) ---
        var allModuleDefs = new[]
        {
            // --- Satış & Pazarlama ---
            ("eticaret",    "E-Ticaret",            "satis",  "popular", 499m,     2990m * 12 / 10, "#8b5cf6", true,  "[\"Online mağaza\",\"Ürün yönetimi\",\"Sipariş takibi\",\"Stok entegrasyonu\",\"Tema editörü\"]",  1),
            ("crm",         "CRM",                  "satis",  "popular", 399m,     3990m * 12 / 10, "#10b981", true,  "[\"Müşteri takibi\",\"Fırsat yönetimi\",\"Kampanyalar\",\"360° profil\"]",                          2),
            ("email",       "E-posta Pazarlama",    "satis",  null,      199m,     1990m * 12 / 10, "#3b82f6", false, "[\"Kampanya tasarımı\",\"Otomasyon\",\"A/B test\",\"Açılma analizi\"]",                             3),
            ("sms",         "SMS Pazarlama",        "satis",  null,      149m,     1490m * 12 / 10, "#06b6d4", false, "[\"Toplu SMS\",\"OTP\",\"Kampanya bildirimleri\"]",                                                 4),
            ("seo",         "SEO Yöneticisi",       "satis",  "new",     249m,     2490m * 12 / 10, "#f59e0b", false, "[\"Anahtar kelime takibi\",\"Meta yönetimi\",\"Sitemap\"]",                                         5),
            ("social",      "Sosyal Medya",         "satis",  null,      199m,     1990m * 12 / 10, "#ec4899", false, "[\"Instagram\",\"Facebook\",\"X — planla & yayınla\"]",                                             6),
            ("marketplace", "Pazaryeri",            "satis",  null,      299m,     2990m * 12 / 10, "#8b5cf6", false, "[\"Trendyol\",\"Hepsiburada\",\"N11 senkronizasyonu\"]",                                           7),
            ("affiliate",   "Affiliate",            "satis",  "beta",    179m,     1790m * 12 / 10, "#6366f1", false, "[\"Partner ağı\",\"Komisyon takibi\",\"Link üretici\"]",                                            8),
            // --- İnsan Kaynakları ---
            ("personel",    "Personel Yönetimi",    "ik",     null,      299m,     2990m * 12 / 10, "#06b6d4", false, "[\"Sicil\",\"Özlük\",\"Organizasyon şeması\"]",                                                    9),
            ("izin",        "İzin & Vardiya",       "ik",     null,      149m,     1490m * 12 / 10, "#06b6d4", false, "[\"Onay akışı\",\"Takvim\",\"Fazla mesai\"]",                                                      10),
            ("bordro",      "Bordro & SGK",         "ik",     null,      249m,     2490m * 12 / 10, "#06b6d4", false, "[\"Otomatik bordro\",\"SGK e-bildirge\"]",                                                         11),
            ("performans",  "Performans",           "ik",     null,      199m,     1990m * 12 / 10, "#06b6d4", false, "[\"360° değerlendirme\",\"OKR/KPI takibi\"]",                                                      12),
            ("ise-alim",    "İşe Alım (ATS)",       "ik",     null,      179m,     1790m * 12 / 10, "#06b6d4", false, "[\"Pozisyon yönetimi\",\"Başvuru havuzu\",\"Mülakat\"]",                                            13),
            // --- Finans ---
            ("muhasebe",    "Muhasebe",             "finans", "new",     349m,     3490m * 12 / 10, "#10b981", false, "[\"E-fatura\",\"Ön muhasebe\",\"GİB entegrasyonu\"]",                                              14),
            ("fatura",      "Fatura Yönetimi",      "finans", null,      149m,     1490m * 12 / 10, "#10b981", false, "[\"E-fatura\",\"E-arşiv\",\"Otomatik takip\"]",                                                    15),
            ("gelir-gider", "Gelir-Gider",          "finans", null,      199m,     1990m * 12 / 10, "#10b981", false, "[\"Gelir takibi\",\"Gider yönetimi\",\"Raporlama\"]",                                               16),
            ("kdv",         "KDV Beyanname",        "finans", null,      179m,     1790m * 12 / 10, "#10b981", false, "[\"KDV hesaplama\",\"Beyanname hazırlama\",\"GİB uyumu\"]",                                         17),
            ("butce",       "Bütçe Planlama",       "finans", null,      149m,     1490m * 12 / 10, "#10b981", false, "[\"Departman bütçeleri\",\"Hedef takibi\",\"Tahmin\"]",                                             18),
            // --- Stok & Lojistik ---
            ("stok",        "Stok Yönetimi",        "stok",   null,      249m,     2490m * 12 / 10, "#f59e0b", false, "[\"Ürün takibi\",\"Kritik stok uyarısı\",\"Lot yönetimi\"]",                                       19),
            ("depo",        "Depo Yönetimi",        "stok",   null,      199m,     1990m * 12 / 10, "#f59e0b", false, "[\"Raf yönetimi\",\"FIFO/LIFO\",\"Transfer emirleri\"]",                                            20),
            ("kargo",       "Kargo Entegrasyonu",   "stok",   null,      149m,     1490m * 12 / 10, "#f59e0b", false, "[\"Yurtiçi Kargo\",\"MNG\",\"Aras\",\"HepsiJET\"]",                                                21),
            ("barkod",      "Barkod & QR",          "stok",   null,      129m,     1290m * 12 / 10, "#f59e0b", false, "[\"Barkod okuma\",\"QR kod üretimi\",\"Toplu işlem\"]",                                             22),
            ("tedarik",     "Tedarik Zinciri",      "stok",   null,      299m,     2990m * 12 / 10, "#f59e0b", false, "[\"Tedarikçi yönetimi\",\"Satın alma emirleri\",\"Teklif karşılaştırma\"]",                         23),
            // --- Müşteri Desteği ---
            ("chat",        "Canlı Destek",         "destek", null,      199m,     1990m * 12 / 10, "#3b82f6", false, "[\"Canlı chat\",\"Bot entegrasyonu\",\"Ziyaretçi takibi\"]",                                        24),
            ("ticket",      "Destek Talepleri",     "destek", null,      149m,     1490m * 12 / 10, "#3b82f6", false, "[\"Ticket yönetimi\",\"SLA takibi\",\"Önceliklendirme\"]",                                          25),
            ("kb",          "Bilgi Bankası",        "destek", null,      129m,     1290m * 12 / 10, "#3b82f6", false, "[\"Makale yönetimi\",\"Arama\",\"Kategori ağacı\"]",                                                26),
            ("callcenter",  "Çağrı Merkezi",        "destek", "new",     249m,     2490m * 12 / 10, "#3b82f6", false, "[\"VoIP\",\"IVR\",\"Çağrı kayıtları\"]",                                                           27),
            // --- Üretim ---
            ("planning",    "Üretim Planlama",      "uretim", null,      299m,     2990m * 12 / 10, "#ec4899", false, "[\"İş emirleri\",\"Kapasite planlama\",\"Üretim takvimi\"]",                                        28),
            ("bom",         "Ürün Reçetesi (BOM)",  "uretim", null,      199m,     1990m * 12 / 10, "#ec4899", false, "[\"Hammadde takibi\",\"Çok seviyeli BOM\",\"Maliyet analizi\"]",                                    29),
            ("kalite",      "Kalite Kontrol",       "uretim", null,      179m,     1790m * 12 / 10, "#ec4899", false, "[\"Kontrol noktaları\",\"Hata takibi\",\"ISO uyum\"]",                                              30),
            ("bakim",       "Bakım Yönetimi",       "uretim", null,      149m,     1490m * 12 / 10, "#ec4899", false, "[\"Önleyici bakım\",\"Arıza takibi\",\"Ekipman kartı\"]",                                           31),
            // --- Verimlilik ---
            ("notes",       "Notlar",               "verim",  null,      99m,      990m * 12 / 10,  "#6366f1", false, "[\"Kişisel notlar\",\"Paylaşımlı notlar\",\"Etiketleme\"]",                                         32),
            ("tasks",       "Görev Takibi",         "verim",  null,      129m,     1290m * 12 / 10, "#6366f1", false, "[\"Görev listesi\",\"Kanban\",\"Deadline takibi\"]",                                                33),
            ("meetings",    "Toplantı Yönetimi",    "verim",  null,      99m,      990m * 12 / 10,  "#6366f1", false, "[\"Takvim entegrasyonu\",\"Gündem\",\"Toplantı notları\"]",                                          34),
            ("docs",        "Döküman Yönetimi",     "verim",  null,      149m,     1490m * 12 / 10, "#6366f1", false, "[\"Dosya depolama\",\"Versiyon takibi\",\"İzin yönetimi\"]",                                        35),
        };

        foreach (var (code, name, cat, tag, priceM, priceY, color, popular, features, order) in allModuleDefs)
        {
            var existing = await db.Modules.FirstOrDefaultAsync(m => m.Code == code, ct);
            if (existing == null)
            {
                db.Modules.Add(new WixiModule
                {
                    Code = code, Name = name, Category = cat, Tag = tag,
                    PriceMonthly = priceM, PriceYearly = priceY,
                    ColorAccent = color, IsPopular = popular, IsPublic = true,
                    FeaturesJson = features, SortOrder = order,
                    Icon = "FaBox"
                });
            }
            else
            {
                existing.Category = cat;
                existing.Tag = tag;
                existing.SortOrder = order;
            }
        }
        await db.SaveChangesAsync(ct);

        // --- Legal Documents seed ---
        if (!await db.LegalDocuments.AnyAsync(ct))
        {
            var privacyDoc = new WixiLegalDocument { Slug = "privacy", Version = "3.2", EffectiveDate = new DateOnly(2026, 5, 1) };
            db.LegalDocuments.Add(privacyDoc);
            if (trLang != null)
                db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation
                {
                    DocumentId = privacyDoc.Id, LanguageId = trLang.Id,
                    Title = "Gizlilik Politikası",
                    ContentHtml = "<p>Bu politika <strong>Wixi Teknoloji A.Ş.</strong> tarafından güncellenmektedir. Güncel içerik için lütfen tekrar ziyaret edin.</p>",
                });
            var kvkkDoc = new WixiLegalDocument { Slug = "kvkk", Version = "2.1", EffectiveDate = new DateOnly(2026, 5, 1) };
            db.LegalDocuments.Add(kvkkDoc);
            if (trLang != null)
                db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation
                {
                    DocumentId = kvkkDoc.Id, LanguageId = trLang.Id,
                    Title = "KVKK Aydınlatma Metni",
                    ContentHtml = "<p>KVKK kapsamında kişisel verileriniz korunmaktadır.</p>",
                });
            await db.SaveChangesAsync(ct);
        }

        if (!await db.LegalDocuments.AnyAsync(d => d.Slug == "terms", ct))
        {
            var termsDoc = new WixiLegalDocument { Slug = "terms", Version = "4.0", EffectiveDate = new DateOnly(2026, 5, 1) };
            db.LegalDocuments.Add(termsDoc);
            if (trLang != null)
                db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation
                {
                    DocumentId = termsDoc.Id, LanguageId = trLang.Id,
                    Title = "Kullanım Şartları",
                    ContentHtml = "",
                });
            if (enLang != null)
                db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation
                {
                    DocumentId = termsDoc.Id, LanguageId = enLang.Id,
                    Title = "Terms of Service",
                    ContentHtml = "",
                });
            await db.SaveChangesAsync(ct);
        }

        if (!await db.LegalDocuments.AnyAsync(d => d.Slug == "cookies", ct))
        {
            var cookiesDoc = new WixiLegalDocument { Slug = "cookies", Version = "1.5", EffectiveDate = new DateOnly(2026, 5, 1) };
            db.LegalDocuments.Add(cookiesDoc);
            if (trLang != null)
                db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation
                {
                    DocumentId = cookiesDoc.Id, LanguageId = trLang.Id,
                    Title = "Çerez Politikası",
                    ContentHtml = "",
                });
            if (enLang != null)
                db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation
                {
                    DocumentId = cookiesDoc.Id, LanguageId = enLang.Id,
                    Title = "Cookie Policy",
                    ContentHtml = "",
                });
            await db.SaveChangesAsync(ct);
        }

        return Ok(new { message = "Landing content seeded successfully." });
    }
}

public record VoteRoadmapRequest(string SessionToken);
