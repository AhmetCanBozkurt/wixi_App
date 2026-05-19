using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Domain.Enums;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.Modules.ECommerce.Infrastructure.Services;

public class ECommerceTenantProvisioner : ITenantProvisioner
{
    public string ModuleName => "ecommerce";

    public async Task ProvisionAsync(string tenantId, string connectionString, string databaseName, CancellationToken cancellationToken = default)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ECommerceDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        var dummyContext = new TenantContext();
        dummyContext.Set(Guid.Parse(tenantId), connectionString, databaseName);

        await using var dbContext = new ECommerceDbContext(optionsBuilder.Options, dummyContext);

        await dbContext.Database.MigrateAsync(cancellationToken);
        await SeedDefaultPagesAsync(dbContext, cancellationToken);
        await SeedDummyDataAsync(dbContext, cancellationToken);
    }

    // ── Default Pages ──────────────────────────────────────────────────────────
    private static async Task SeedDefaultPagesAsync(ECommerceDbContext db, CancellationToken ct)
    {
        if (await db.StorePages.AnyAsync(ct))
            return;

        var defaultPages = new List<WixiStorePage>
        {
            new()
            {
                Id = Guid.NewGuid(),
                PageType = StorePageType.Home,
                Slug = "home",
                Title = "Ana Sayfa",
                IsPublished = true,
                PublishedAt = DateTime.UtcNow,
                LayoutConfigJson = """[{"id":"1","type":"hero","props":{"title":"Hoş Geldiniz","subtitle":"Mağazamızı keşfedın","buttonText":"Alışverişe Başla","buttonLink":"/store","imageUrl":""}},{"id":"2","type":"featured-products","props":{"title":"Öne Çıkan Ürünler","limit":4}},{"id":"3","type":"categories-grid","props":{"title":"Kategoriler"}}]""",
            },
            new()
            {
                Id = Guid.NewGuid(),
                PageType = StorePageType.About,
                Slug = "hakkimizda",
                Title = "Hakkımızda",
                IsPublished = true,
                PublishedAt = DateTime.UtcNow,
                LayoutConfigJson = """[{"id":"1","type":"text-image","props":{"title":"Biz Kimiz?","text":"Hikayemizi buraya yazın...","imagePosition":"left","imageUrl":""}}]""",
            },
            new()
            {
                Id = Guid.NewGuid(),
                PageType = StorePageType.Contact,
                Slug = "iletisim",
                Title = "İletişim",
                IsPublished = true,
                PublishedAt = DateTime.UtcNow,
                LayoutConfigJson = """[{"id":"1","type":"contact-form","props":{"title":"Bize Ulaşın","submitText":"Gönder","successMessage":"Mesajınız alındı, en kısa sürede size dönüş yapacağız."}}]""",
            },
        };

        db.StorePages.AddRange(defaultPages);
        await db.SaveChangesAsync(ct);
    }

    // ── Demo Data ──────────────────────────────────────────────────────────────
    private static async Task SeedDummyDataAsync(ECommerceDbContext db, CancellationToken ct)
    {
        // Her bölüm idempotent — zaten veri varsa atlar

        // 1. Kategoriler
        if (!await db.Categories.AnyAsync(ct))
        {
            var categories = new[]
            {
                new WixiCategory { Id = Guid.NewGuid(), Name = "Elektronik",   Slug = "elektronik",   Description = "Telefon, bilgisayar ve aksesuar", IsActive = true },
                new WixiCategory { Id = Guid.NewGuid(), Name = "Giyim",        Slug = "giyim",        Description = "Kadın, erkek ve çocuk giyimi",    IsActive = true },
                new WixiCategory { Id = Guid.NewGuid(), Name = "Ev & Yaşam",   Slug = "ev-yasam",     Description = "Mobilya, dekorasyon ve mutfak",   IsActive = true },
                new WixiCategory { Id = Guid.NewGuid(), Name = "Kitap & Kırtasiye", Slug = "kitap", Description = "Roman, bilim ve hobi kitapları",   IsActive = true },
            };
            db.Categories.AddRange(categories);
            await db.SaveChangesAsync(ct);
        }

        // 2. Markalar
        if (!await db.Brands.AnyAsync(ct))
        {
            var brands = new[]
            {
                new WixiBrand { Id = Guid.NewGuid(), Name = "TechPlus",  Slug = "techplus",  Description = "Lider teknoloji markası",     LogoUrl = "https://placehold.co/120x60?text=TechPlus",  IsActive = true },
                new WixiBrand { Id = Guid.NewGuid(), Name = "ModaLine",  Slug = "modaline",  Description = "Şık ve uygun fiyatlı moda",   LogoUrl = "https://placehold.co/120x60?text=ModaLine",  IsActive = true },
                new WixiBrand { Id = Guid.NewGuid(), Name = "HomeStyle", Slug = "homestyle", Description = "Evinize değer katan tasarımlar", LogoUrl = "https://placehold.co/120x60?text=HomeStyle", IsActive = true },
            };
            db.Brands.AddRange(brands);
            await db.SaveChangesAsync(ct);
        }

        // 3. Ürünler
        if (!await db.Products.AnyAsync(ct))
        {
            var cat = await db.Categories.ToDictionaryAsync(c => c.Slug, ct);
            var brand = await db.Brands.ToDictionaryAsync(b => b.Slug, ct);

            var products = new[]
            {
                new WixiProduct { Id = Guid.NewGuid(), Name = "Kablosuz Bluetooth Kulaklık", Slug = "kablosuz-bluetooth-kulaklik",
                    ShortDescription = "40 saat pil, aktif gürültü engelleme", BasePrice = 1299, CompareAtPrice = 1799,
                    CategoryId = cat.GetValueOrDefault("elektronik")?.Id, BrandId = brand.GetValueOrDefault("techplus")?.Id,
                    IsFeatured = true, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Kulaklik", SortOrder = 0 } ] },

                new WixiProduct { Id = Guid.NewGuid(), Name = "Akıllı Saat Pro X", Slug = "akilli-saat-pro-x",
                    ShortDescription = "GPS, kalp ritmi, 7 gün pil ömrü", BasePrice = 2499, CompareAtPrice = 2999,
                    CategoryId = cat.GetValueOrDefault("elektronik")?.Id, BrandId = brand.GetValueOrDefault("techplus")?.Id,
                    IsFeatured = true, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Saat", SortOrder = 0 } ] },

                new WixiProduct { Id = Guid.NewGuid(), Name = "Taşınabilir Şarj Cihazı 20000mAh", Slug = "tasınabilir-sarj-cihazi",
                    ShortDescription = "3 port, hızlı şarj, ince tasarım", BasePrice = 449, CompareAtPrice = 599,
                    CategoryId = cat.GetValueOrDefault("elektronik")?.Id, BrandId = brand.GetValueOrDefault("techplus")?.Id,
                    IsFeatured = false, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Sarj", SortOrder = 0 } ] },

                new WixiProduct { Id = Guid.NewGuid(), Name = "Slim Fit Erkek Gömlek", Slug = "slim-fit-erkek-gomlek",
                    ShortDescription = "Pamuklu, nefes alan kumaş, 5 renk seçeneği", BasePrice = 299, CompareAtPrice = 399,
                    CategoryId = cat.GetValueOrDefault("giyim")?.Id, BrandId = brand.GetValueOrDefault("modaline")?.Id,
                    IsFeatured = true, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Gomlek", SortOrder = 0 } ] },

                new WixiProduct { Id = Guid.NewGuid(), Name = "Kadın Spor Tayt", Slug = "kadin-spor-tayt",
                    ShortDescription = "Yüksek bel, dört yönlü esnek kumaş", BasePrice = 249, CompareAtPrice = 349,
                    CategoryId = cat.GetValueOrDefault("giyim")?.Id, BrandId = brand.GetValueOrDefault("modaline")?.Id,
                    IsFeatured = false, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Tayt", SortOrder = 0 } ] },

                new WixiProduct { Id = Guid.NewGuid(), Name = "Minimalist Yan Sehpa", Slug = "minimalist-yan-sehpa",
                    ShortDescription = "Bambu-metal karışımı, 3 renk", BasePrice = 799, CompareAtPrice = null,
                    CategoryId = cat.GetValueOrDefault("ev-yasam")?.Id, BrandId = brand.GetValueOrDefault("homestyle")?.Id,
                    IsFeatured = true, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Sehpa", SortOrder = 0 } ] },

                new WixiProduct { Id = Guid.NewGuid(), Name = "Döküm Tava Seti 3lü", Slug = "dokum-tava-seti",
                    ShortDescription = "28cm+24cm+20cm, PFOA içermez", BasePrice = 1199, CompareAtPrice = 1499,
                    CategoryId = cat.GetValueOrDefault("ev-yasam")?.Id, BrandId = brand.GetValueOrDefault("homestyle")?.Id,
                    IsFeatured = false, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Tava", SortOrder = 0 } ] },

                new WixiProduct { Id = Guid.NewGuid(), Name = "Yazılım Mimarisi: Temiz Kod", Slug = "yazilim-mimarisi-temiz-kod",
                    ShortDescription = "400 sayfa, Türkçe, yazılım geliştirme rehberi", BasePrice = 149, CompareAtPrice = 199,
                    CategoryId = cat.GetValueOrDefault("kitap")?.Id, BrandId = null,
                    IsFeatured = false, IsActive = true,
                    Media = [ new WixiProductMedia { Id = Guid.NewGuid(), Url = "https://placehold.co/600x400?text=Kitap", SortOrder = 0 } ] },
            };
            db.Products.AddRange(products);
            await db.SaveChangesAsync(ct);
        }

        // 4. Müşteriler
        if (!await db.Customers.AnyAsync(ct))
        {
            var hash = BCrypt.Net.BCrypt.HashPassword("Demo1234!");
            var customers = new[]
            {
                new WixiCustomer { Id = Guid.NewGuid(), FirstName = "Ayşe",  LastName = "Kaya",    Email = "ayse.kaya@demo.com",   PasswordHash = hash, PhoneNumber = "0532 111 22 33", IsActive = true, IsEmailVerified = true },
                new WixiCustomer { Id = Guid.NewGuid(), FirstName = "Mehmet", LastName = "Demir",  Email = "mehmet.demir@demo.com", PasswordHash = hash, PhoneNumber = "0542 333 44 55", IsActive = true, IsEmailVerified = true },
                new WixiCustomer { Id = Guid.NewGuid(), FirstName = "Zeynep", LastName = "Arslan", Email = "zeynep.arslan@demo.com", PasswordHash = hash, PhoneNumber = "0551 555 66 77", IsActive = true, IsEmailVerified = false },
            };
            db.Customers.AddRange(customers);
            await db.SaveChangesAsync(ct);
        }

        // 5. Siparişler
        if (!await db.Orders.AnyAsync(ct))
        {
            var customers = await db.Customers.ToListAsync(ct);
            var products  = await db.Products.ToListAsync(ct);

            if (customers.Count >= 3 && products.Count >= 7)
            {
                var addr1 = "Atatürk Cad. No:12 Daire:4, Çankaya / Ankara 06100";
                var addr2 = "İstiklal Cad. No:45, Beyoğlu / İstanbul 34430";
                var addr3 = "Kordon Boyu No:7, Alsancak / İzmir 35220";

                var orders = new List<WixiOrder>
                {
                    new()
                    {
                        Id = Guid.NewGuid(), OrderNumber = "WX-10001",
                        CustomerId = customers[0].Id, Currency = "TRY",
                        Status = OrderStatus.Delivered, TotalAmount = 1748m,
                        ShippingAddress = addr1, BillingAddress = addr1,
                        TrackingNumber = "TR12345678901", ShippingProvider = "Yurtiçi Kargo",
                        CreatedAt = DateTime.UtcNow.AddDays(-15), IsActive = true,
                        Items =
                        [
                            new WixiOrderItem { Id = Guid.NewGuid(), ProductId = products[0].Id, ProductName = products[0].Name, Quantity = 1, UnitPrice = 1299m, TotalPrice = 1299m },
                            new WixiOrderItem { Id = Guid.NewGuid(), ProductId = products[2].Id, ProductName = products[2].Name, Quantity = 1, UnitPrice = 449m,  TotalPrice = 449m  },
                        ]
                    },
                    new()
                    {
                        Id = Guid.NewGuid(), OrderNumber = "WX-10002",
                        CustomerId = customers[1].Id, Currency = "TRY",
                        Status = OrderStatus.Shipped, TotalAmount = 2499m,
                        ShippingAddress = addr2, BillingAddress = addr2,
                        TrackingNumber = "TR98765432100", ShippingProvider = "MNG Kargo",
                        CreatedAt = DateTime.UtcNow.AddDays(-7), IsActive = true,
                        Items =
                        [
                            new WixiOrderItem { Id = Guid.NewGuid(), ProductId = products[1].Id, ProductName = products[1].Name, Quantity = 1, UnitPrice = 2499m, TotalPrice = 2499m },
                        ]
                    },
                    new()
                    {
                        Id = Guid.NewGuid(), OrderNumber = "WX-10003",
                        CustomerId = customers[2].Id, Currency = "TRY",
                        Status = OrderStatus.Processing, TotalAmount = 897m,
                        ShippingAddress = addr3, BillingAddress = addr3,
                        CreatedAt = DateTime.UtcNow.AddDays(-3), IsActive = true,
                        Items =
                        [
                            new WixiOrderItem { Id = Guid.NewGuid(), ProductId = products[3].Id, ProductName = products[3].Name, Quantity = 3, UnitPrice = 299m, TotalPrice = 897m },
                        ]
                    },
                    new()
                    {
                        Id = Guid.NewGuid(), OrderNumber = "WX-10004",
                        CustomerId = customers[0].Id, Currency = "TRY",
                        Status = OrderStatus.Paid, TotalAmount = 1199m,
                        ShippingAddress = addr1, BillingAddress = addr1,
                        CreatedAt = DateTime.UtcNow.AddDays(-1), IsActive = true,
                        Items =
                        [
                            new WixiOrderItem { Id = Guid.NewGuid(), ProductId = products[6].Id, ProductName = products[6].Name, Quantity = 1, UnitPrice = 1199m, TotalPrice = 1199m },
                        ]
                    },
                    new()
                    {
                        Id = Guid.NewGuid(), OrderNumber = "WX-10005",
                        CustomerId = customers[1].Id, Currency = "TRY",
                        Status = OrderStatus.Cancelled, TotalAmount = 798m,
                        ShippingAddress = addr2, BillingAddress = addr2,
                        CreatedAt = DateTime.UtcNow.AddDays(-20), IsActive = true,
                        Items =
                        [
                            new WixiOrderItem { Id = Guid.NewGuid(), ProductId = products[5].Id, ProductName = products[5].Name, Quantity = 1, UnitPrice = 799m, TotalPrice = 799m },
                        ]
                    },
                };

                db.Orders.AddRange(orders);
                await db.SaveChangesAsync(ct);
            }
        }

        // 6. Yorumlar (Testimonials)
        if (!await db.Testimonials.AnyAsync(ct))
        {
            var testimonials = new[]
            {
                new WixiTestimonial { Id = Guid.NewGuid(), CustomerName = "Ayşe K.", CustomerTitle = "Öğretmen",
                    Quote = "Ürünler gerçekten kaliteli! Kargo da çok hızlıydı, beklediğimden iki gün önce geldi. Kesinlikle tavsiye ederim.", Rating = 5, SortOrder = 1, IsActive = true },
                new WixiTestimonial { Id = Guid.NewGuid(), CustomerName = "Mehmet D.", CustomerTitle = "Yazılım Geliştirici",
                    Quote = "Akıllı saati bir aydır kullanıyorum, GPS hassasiyeti mükemmel. Pil ömrü de iddia ettiği gibi 7 gün dayanıyor.", Rating = 5, SortOrder = 2, IsActive = true },
                new WixiTestimonial { Id = Guid.NewGuid(), CustomerName = "Zeynep A.", CustomerTitle = "İç Mimar",
                    Quote = "Yan sehpa tasarımı harika, tam beklediğim gibi. Montajı da çok kolaydı. Fiyat-performans açısından çok iyi.", Rating = 4, SortOrder = 3, IsActive = true },
            };
            db.Testimonials.AddRange(testimonials);
            await db.SaveChangesAsync(ct);
        }

        // 7. Promo Bannerlar
        if (!await db.PromoBanners.AnyAsync(ct))
        {
            var banners = new[]
            {
                new WixiPromoBanner { Id = Guid.NewGuid(), Title = "Yaz Sonu İndirimi!", Subtitle = "Seçili ürünlerde %30'a varan indirim",
                    ButtonText = "Hemen Al", ButtonUrl = "/store", BackgroundColor = "#ec4899", TextColor = "#ffffff",
                    Layout = "overlay", SortOrder = 1, IsActive = true },
                new WixiPromoBanner { Id = Guid.NewGuid(), Title = "Ücretsiz Kargo",    Subtitle = "200₺ ve üzeri tüm siparişlerde",
                    ButtonText = "Alışverişe Başla", ButtonUrl = "/store", BackgroundColor = "#3b82f6", TextColor = "#ffffff",
                    Layout = "simple", SortOrder = 2, IsActive = true },
            };
            db.PromoBanners.AddRange(banners);
            await db.SaveChangesAsync(ct);
        }

        // 8. Slider
        if (!await db.Sliders.AnyAsync(ct))
        {
            var slider = new WixiSlider
            {
                Id = Guid.NewGuid(), Name = "Ana Sayfa Slider", AutoPlay = true, AutoPlayInterval = 4000,
                ShowDots = true, ShowArrows = true, IsActive = true,
                Slides =
                [
                    new WixiSliderSlide { Id = Guid.NewGuid(), Title = "En Yeni Ürünler", Subtitle = "2024 koleksiyonu şimdi mağazamızda",
                        ImageUrl = "https://placehold.co/1200x500?text=Slide+1", ButtonText = "Keşfet", ButtonUrl = "/store", SortOrder = 1 },
                    new WixiSliderSlide { Id = Guid.NewGuid(), Title = "Özel Teklifler",  Subtitle = "Haftanın fırsatlarını kaçırma",
                        ImageUrl = "https://placehold.co/1200x500?text=Slide+2", ButtonText = "Fırsatları Gör", ButtonUrl = "/store", SortOrder = 2 },
                    new WixiSliderSlide { Id = Guid.NewGuid(), Title = "Hızlı Teslimat",  Subtitle = "Siparişiniz 24 saat içinde kapınızda",
                        ImageUrl = "https://placehold.co/1200x500?text=Slide+3", ButtonText = "Sipariş Ver", ButtonUrl = "/store", SortOrder = 3 },
                ]
            };
            db.Sliders.Add(slider);
            await db.SaveChangesAsync(ct);
        }

        // 9. SSS
        if (!await db.FaqItems.AnyAsync(ct))
        {
            var faqItems = new[]
            {
                new WixiFaqItem { Id = Guid.NewGuid(), Question = "Siparişimi nasıl takip edebilirim?",
                    Answer = "Hesabınıza giriş yaparak \"Siparişlerim\" bölümünden takip numaranızı öğrenebilir ve kargo firmasının web sitesinden anlık olarak takip edebilirsiniz.",
                    Category = "Sipariş", SortOrder = 1, IsActive = true },
                new WixiFaqItem { Id = Guid.NewGuid(), Question = "İade ve değişim koşulları nelerdir?",
                    Answer = "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde orijinal ambalajında, kullanılmamış olarak iade edebilirsiniz. İade kargo ücreti tarafımızca karşılanmaktadır.",
                    Category = "İade", SortOrder = 2, IsActive = true },
                new WixiFaqItem { Id = Guid.NewGuid(), Question = "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
                    Answer = "Kredi kartı (3D Secure), banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kabul ediyoruz. Kredi kartı ile 12 aya kadar taksit imkânı sunuyoruz.",
                    Category = "Ödeme", SortOrder = 3, IsActive = true },
                new WixiFaqItem { Id = Guid.NewGuid(), Question = "Kargo süresi ne kadar?",
                    Answer = "Standart teslimat 2-4 iş günüdür. Ekspres teslimat seçeneğinde siparişiniz 1 iş günü içinde teslim edilir.",
                    Category = "Kargo", SortOrder = 4, IsActive = true },
                new WixiFaqItem { Id = Guid.NewGuid(), Question = "Fatura bilgilerimi nasıl güncellerim?",
                    Answer = "Hesabım > Fatura Bilgileri bölümünden fatura adresinizi ve vergi bilgilerinizi güncelleyebilirsiniz. Kurumsal fatura için lütfen müşteri hizmetleri ile iletişime geçin.",
                    Category = "Hesap", SortOrder = 5, IsActive = true },
            };
            db.FaqItems.AddRange(faqItems);
            await db.SaveChangesAsync(ct);
        }
    }
}
