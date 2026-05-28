using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.Modules.ECommerce.Infrastructure.Data;

/// <summary>
/// Her tenant'ın kendi veritabanına bağlanan dinamik context.
/// TenantContext'ten bağlantı dizisini alır — her request kendi DB'sine gider.
/// </summary>
public class ECommerceDbContext : DbContext
{
    private readonly TenantContext _tenantContext;

    public ECommerceDbContext(
        DbContextOptions<ECommerceDbContext> options,
        TenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    // Ürün Kataloğu
    public DbSet<WixiProduct> Products => Set<WixiProduct>();
    public DbSet<WixiProductVariant> ProductVariants => Set<WixiProductVariant>();
    public DbSet<WixiCustomer> Customers => Set<WixiCustomer>();
    public DbSet<WixiProductMedia> ProductMedia => Set<WixiProductMedia>();
    public DbSet<WixiCategory> Categories => Set<WixiCategory>();
    public DbSet<WixiBrand> Brands => Set<WixiBrand>();
    public DbSet<WixiOrder> Orders => Set<WixiOrder>();
    public DbSet<WixiOrderItem> OrderItems => Set<WixiOrderItem>();
    public DbSet<WixiStoreSettings> StoreSettings => Set<WixiStoreSettings>();
    public DbSet<WixiStorePage> StorePages => Set<WixiStorePage>();
    public DbSet<WixiCartItem> CartItems => Set<WixiCartItem>();
    public DbSet<WixiNewsletterSubscription> NewsletterSubscriptions => Set<WixiNewsletterSubscription>();
    public DbSet<WixiThemeVersion> ThemeVersions => Set<WixiThemeVersion>();

    // Depo & Stok
    public DbSet<WixiWarehouse> Warehouses => Set<WixiWarehouse>();
    public DbSet<WixiStock> Stocks => Set<WixiStock>();
    public DbSet<WixiStockMovement> StockMovements => Set<WixiStockMovement>();

    // Adresler
    public DbSet<WixiAddress> Addresses => Set<WixiAddress>();

    // Cari / B2B
    public DbSet<WixiContact> Contacts => Set<WixiContact>();
    public DbSet<WixiCariLedger> CariLedger => Set<WixiCariLedger>();

    // Kampanya & Sadakat
    public DbSet<WixiCoupon> Coupons => Set<WixiCoupon>();
    public DbSet<WixiFavorite> Favorites => Set<WixiFavorite>();
    public DbSet<WixiLoyaltyPoint> LoyaltyPoints => Set<WixiLoyaltyPoint>();

    // İçerik Modelleri
    public DbSet<WixiTestimonial> Testimonials => Set<WixiTestimonial>();
    public DbSet<WixiPromoBanner> PromoBanners => Set<WixiPromoBanner>();
    public DbSet<WixiSlider> Sliders => Set<WixiSlider>();
    public DbSet<WixiSliderSlide> SliderSlides => Set<WixiSliderSlide>();
    public DbSet<WixiFaqItem> FaqItems => Set<WixiFaqItem>();
    public DbSet<WixiContactFormSubmission> ContactSubmissions => Set<WixiContactFormSubmission>();

    // Müşteri Şifre Sıfırlama
    public DbSet<WixiCustomerResetToken> CustomerResetTokens => Set<WixiCustomerResetToken>();

    // Ödeme Logları
    public DbSet<WixiPaymentLog> PaymentLogs => Set<WixiPaymentLog>();

    // Ödeme Ayarları (tenant'ın kendi DB'sinde saklanır)
    public DbSet<WixiTenantPaymentSetting> PaymentSettings => Set<WixiTenantPaymentSetting>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // TenantContext doldurulmuşsa tenant DB'sine bağlan
        if (!optionsBuilder.IsConfigured && _tenantContext.IsResolved)
        {
            optionsBuilder.UseSqlServer(_tenantContext.ConnectionString);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── WixiProduct ──────────────────────────────────────────
        modelBuilder.Entity<WixiProduct>(entity =>
        {
            entity.ToTable("WIXI_EC_PRODUCTS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(500).IsRequired();
            entity.Property(e => e.BasePrice).HasPrecision(18, 2);
            entity.Property(e => e.CompareAtPrice).HasPrecision(18, 2);
            entity.Property(e => e.CostPrice).HasPrecision(18, 2);
            entity.Property(e => e.MetaTitle).HasMaxLength(160);
            entity.Property(e => e.MetaDescription).HasMaxLength(320);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Brand)
                .WithMany(b => b.Products)
                .HasForeignKey(e => e.BrandId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.Variants)
                .WithOne(v => v.Product)
                .HasForeignKey(v => v.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Media)
                .WithOne(m => m.Product)
                .HasForeignKey(m => m.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiProductVariant ────────────────────────────────────
        modelBuilder.Entity<WixiProductVariant>(entity =>
        {
            entity.ToTable("WIXI_EC_PRODUCT_VARIANTS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SKU).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(300).IsRequired();
            entity.Property(e => e.SKU).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Barcode).HasMaxLength(100);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.CompareAtPrice).HasPrecision(18, 2);
            entity.Property(e => e.WeightGrams).HasPrecision(10, 2);
            entity.Property(e => e.AttributesJson).HasColumnType("nvarchar(max)");
        });

        // ── WixiProductMedia ──────────────────────────────────────
        modelBuilder.Entity<WixiProductMedia>(entity =>
        {
            entity.ToTable("WIXI_EC_PRODUCT_MEDIA");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Url).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.ThumbnailUrl).HasMaxLength(2000);
            entity.Property(e => e.AltText).HasMaxLength(500);
        });

        // ── WixiCategory ──────────────────────────────────────────
        modelBuilder.Entity<WixiCategory>(entity =>
        {
            entity.ToTable("WIXI_EC_CATEGORIES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(300).IsRequired();
            entity.Property(e => e.MetaTitle).HasMaxLength(160);
            entity.Property(e => e.MetaDescription).HasMaxLength(320);

            entity.HasOne(e => e.Parent)
                .WithMany(p => p.Children)
                .HasForeignKey(e => e.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── WixiBrand ─────────────────────────────────────────────
        modelBuilder.Entity<WixiBrand>(entity =>
        {
            entity.ToTable("WIXI_EC_BRANDS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(300).IsRequired();
            entity.Property(e => e.LogoUrl).HasMaxLength(2000);
            entity.Property(e => e.WebsiteUrl).HasMaxLength(500);
        });

        // ── WixiCustomer ──────────────────────────────────────────
        modelBuilder.Entity<WixiCustomer>(entity =>
        {
            entity.ToTable("WIXI_EC_CUSTOMERS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.FirstName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(320).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
        });

        // ── WixiOrder ─────────────────────────────────────────────
        modelBuilder.Entity<WixiOrder>(entity =>
        {
            entity.ToTable("WIXI_EC_ORDERS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.OrderNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(10).IsRequired();
            entity.Property(e => e.ShippingAddress).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.BillingAddress).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.TrackingNumber).HasMaxLength(100);
            entity.Property(e => e.ShippingProvider).HasMaxLength(100);

            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── WixiOrderItem ─────────────────────────────────────────
        modelBuilder.Entity<WixiOrderItem>(entity =>
        {
            entity.ToTable("WIXI_EC_ORDER_ITEMS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductName).HasMaxLength(500).IsRequired();
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            entity.Property(e => e.SKU).HasMaxLength(100);

            entity.HasOne(e => e.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiStoreSettings ─────────────────────────────────────
        modelBuilder.Entity<WixiStoreSettings>(entity =>
        {
            entity.ToTable("WIXI_EC_STORE_SETTINGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StoreName).HasMaxLength(300).IsRequired();
            entity.Property(e => e.LogoUrl).HasMaxLength(2000);
            entity.Property(e => e.ContactEmail).HasMaxLength(320);
            entity.Property(e => e.SeoTitle).HasMaxLength(160);
            entity.Property(e => e.ThemeConfigJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.LayoutConfigJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.SocialLinksJson).HasColumnType("nvarchar(max)");
        });

        // ── WixiProduct (IsFeatured) ──────────────────────────────
        modelBuilder.Entity<WixiProduct>()
            .Property(e => e.IsFeatured)
            .HasColumnType("bit");

        // ── WixiCartItem ──────────────────────────────────────────
        modelBuilder.Entity<WixiCartItem>(entity =>
        {
            entity.ToTable("WIXI_EC_CART_ITEMS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CustomerId);
            entity.Property(e => e.ProductName).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ProductSlug).HasMaxLength(500).IsRequired();
            entity.Property(e => e.SessionId).HasMaxLength(100);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
        });

        // ── WixiNewsletterSubscription ────────────────────────────
        modelBuilder.Entity<WixiNewsletterSubscription>(entity =>
        {
            entity.ToTable("WIXI_EC_NEWSLETTER_SUBS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(320).IsRequired();
        });

        // ── WixiTestimonial ───────────────────────────────────────
        modelBuilder.Entity<WixiTestimonial>(entity =>
        {
            entity.ToTable("WIXI_EC_TESTIMONIALS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CustomerName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Quote).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.CustomerTitle).HasMaxLength(200);
            entity.Property(e => e.CustomerAvatarUrl).HasMaxLength(2000);
        });

        // ── WixiPromoBanner ───────────────────────────────────────
        modelBuilder.Entity<WixiPromoBanner>(entity =>
        {
            entity.ToTable("WIXI_EC_PROMO_BANNERS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Subtitle).HasMaxLength(500);
            entity.Property(e => e.ImageUrl).HasMaxLength(2000);
            entity.Property(e => e.ButtonText).HasMaxLength(100);
            entity.Property(e => e.ButtonUrl).HasMaxLength(500);
            entity.Property(e => e.BackgroundColor).HasMaxLength(50);
            entity.Property(e => e.TextColor).HasMaxLength(50);
            entity.Property(e => e.Layout).HasMaxLength(50);
        });

        // ── WixiSlider ────────────────────────────────────────────
        modelBuilder.Entity<WixiSlider>(entity =>
        {
            entity.ToTable("WIXI_EC_SLIDERS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();

            entity.HasMany(e => e.Slides)
                .WithOne(s => s.Slider)
                .HasForeignKey(s => s.SliderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiSliderSlide ───────────────────────────────────────
        modelBuilder.Entity<WixiSliderSlide>(entity =>
        {
            entity.ToTable("WIXI_EC_SLIDER_SLIDES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ImageUrl).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(300);
            entity.Property(e => e.Subtitle).HasMaxLength(500);
            entity.Property(e => e.ButtonText).HasMaxLength(100);
            entity.Property(e => e.ButtonUrl).HasMaxLength(500);
        });

        // ── WixiFaqItem ───────────────────────────────────────────
        modelBuilder.Entity<WixiFaqItem>(entity =>
        {
            entity.ToTable("WIXI_EC_FAQ_ITEMS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Question).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Answer).HasMaxLength(4000).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100);
        });

        // ── WixiContactFormSubmission ─────────────────────────────
        modelBuilder.Entity<WixiContactFormSubmission>(entity =>
        {
            entity.ToTable("WIXI_EC_CONTACT_SUBMISSIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(320).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Subject).HasMaxLength(300);
            entity.Property(e => e.Message).HasMaxLength(4000).IsRequired();
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.HasIndex(e => e.Email);
        });

        // ── WixiStorePage ─────────────────────────────────────────
        modelBuilder.Entity<WixiStorePage>(entity =>
        {
            entity.ToTable("WIXI_EC_STORE_PAGES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Slug).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(300).IsRequired();
            entity.Property(e => e.MetaTitle).HasMaxLength(160);
            entity.Property(e => e.MetaDescription).HasMaxLength(320);
            entity.Property(e => e.MetaKeywords).HasMaxLength(500);
            entity.Property(e => e.OpenGraphImageUrl).HasMaxLength(2000);
            entity.Property(e => e.LayoutConfigJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.ThemeOverrideJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.BacklinksJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.PageType).HasConversion<int>();
        });

        // ── WixiWarehouse ─────────────────────────────────────────
        modelBuilder.Entity<WixiWarehouse>(entity =>
        {
            entity.ToTable("WIXI_EC_WAREHOUSES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Address).HasMaxLength(1000);
        });

        // ── WixiStock ─────────────────────────────────────────────
        modelBuilder.Entity<WixiStock>(entity =>
        {
            entity.ToTable("WIXI_EC_STOCK");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.VariantId, e.WarehouseId }).IsUnique();

            entity.HasOne(e => e.Variant)
                .WithMany()
                .HasForeignKey(e => e.VariantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Warehouse)
                .WithMany(w => w.Stocks)
                .HasForeignKey(e => e.WarehouseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiStockMovement ──────────────────────────────────────
        modelBuilder.Entity<WixiStockMovement>(entity =>
        {
            entity.ToTable("WIXI_EC_STOCK_MOVEMENTS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Type).HasConversion<int>();

            entity.HasOne(e => e.Variant)
                .WithMany()
                .HasForeignKey(e => e.VariantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Warehouse)
                .WithMany(w => w.Movements)
                .HasForeignKey(e => e.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToWarehouse)
                .WithMany()
                .HasForeignKey(e => e.ToWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── WixiContact ───────────────────────────────────────────────
        modelBuilder.Entity<WixiContact>(entity =>
        {
            entity.ToTable("WIXI_EC_CONTACTS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(300).IsRequired();
            entity.Property(e => e.TaxNumber).HasMaxLength(20);
            entity.Property(e => e.TaxOffice).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(320);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Address).HasMaxLength(1000);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.ContactPersonName).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.Balance).HasPrecision(18, 2);
            entity.Property(e => e.Type).HasConversion<int>();
            entity.HasIndex(e => e.Type);
        });

        // ── WixiCariLedger ────────────────────────────────────────────
        modelBuilder.Entity<WixiCariLedger>(entity =>
        {
            entity.ToTable("WIXI_EC_CARI_LEDGER");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.BalanceAfter).HasPrecision(18, 2);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ReferenceNo).HasMaxLength(100);
            entity.Property(e => e.EntryType).HasConversion<int>();

            entity.HasOne(e => e.Contact)
                .WithMany(c => c.LedgerEntries)
                .HasForeignKey(e => e.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ContactId);
            entity.HasIndex(e => e.MovementDate);
        });

        // ── WixiCoupon ────────────────────────────────────────────────
        modelBuilder.Entity<WixiCoupon>(entity =>
        {
            entity.ToTable("WIXI_EC_COUPONS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.DiscountValue).HasPrecision(18, 2);
            entity.Property(e => e.MinOrderAmount).HasPrecision(18, 2);
            entity.Property(e => e.DiscountType).HasConversion<int>();
        });

        // ── WixiFavorite ──────────────────────────────────────────────
        modelBuilder.Entity<WixiFavorite>(entity =>
        {
            entity.ToTable("WIXI_EC_FAVORITES");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.CustomerId, e.ProductId }).IsUnique();
        });

        // ── WixiLoyaltyPoint ──────────────────────────────────────────
        modelBuilder.Entity<WixiLoyaltyPoint>(entity =>
        {
            entity.ToTable("WIXI_EC_LOYALTY_POINTS");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CustomerId);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Type).HasConversion<int>();
        });

        // ── WixiThemeVersion ──────────────────────────────────────────
        modelBuilder.Entity<WixiThemeVersion>(entity =>
        {
            entity.ToTable("WIXI_EC_THEME_VERSIONS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.VersionType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.VersionLabel).HasMaxLength(200);
            entity.Property(e => e.ChangedByEmail).HasMaxLength(320);
            entity.HasIndex(e => new { e.StoreSettingsId, e.VersionNumber });
            entity.HasIndex(e => new { e.StoreSettingsId, e.IsPublished });
            entity.HasOne(e => e.StoreSettings)
                  .WithMany()
                  .HasForeignKey(e => e.StoreSettingsId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiAddress ───────────────────────────────────────────────
        modelBuilder.Entity<WixiAddress>(entity =>
        {
            entity.ToTable("WIXI_EC_ADDRESSES");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50).IsRequired();
            entity.Property(e => e.AddressLine).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.City).HasMaxLength(100).IsRequired();
            entity.Property(e => e.District).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ZipCode).HasMaxLength(20);
            entity.Property(e => e.AddressType).HasConversion<int>();
            entity.HasIndex(e => e.CustomerId);
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Addresses)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiCustomerResetToken ────────────────────────────────────
        modelBuilder.Entity<WixiCustomerResetToken>(entity =>
        {
            entity.ToTable("WIXI_EC_CUSTOMER_RESET_TOKENS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TokenHash).HasMaxLength(64).IsRequired();
            entity.HasIndex(e => e.TokenHash).IsUnique();
            entity.HasIndex(e => e.CustomerId);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.HasOne(e => e.Customer)
                  .WithMany()
                  .HasForeignKey(e => e.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WixiPaymentLog ────────────────────────────────────────────
        modelBuilder.Entity<WixiPaymentLog>(e =>
        {
            e.ToTable("WIXI_PAYMENT_LOGS");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Order)
             .WithMany()
             .HasForeignKey(x => x.OrderId)
             .OnDelete(DeleteBehavior.Restrict);
            e.Property(x => x.ConversationId).HasMaxLength(100);
            e.Property(x => x.Token).HasMaxLength(500);
            e.Property(x => x.PaymentId).HasMaxLength(100);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.ErrorMessage).HasMaxLength(1000);
            e.Property(x => x.Gateway).HasMaxLength(50);
            e.Property(x => x.Currency).HasMaxLength(10);
            e.HasIndex(x => x.Token);
            e.HasIndex(x => x.OrderId);
        });

        // ── WixiTenantPaymentSetting ──────────────────────────────────
        modelBuilder.Entity<WixiTenantPaymentSetting>(entity =>
        {
            entity.ToTable("WIXI_EC_PAYMENT_SETTINGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActiveGateway).IsRequired().HasMaxLength(30);
            entity.Property(e => e.StripeSecretKey).HasMaxLength(1000);
            entity.Property(e => e.StripePublishableKey).HasMaxLength(1000);
            entity.Property(e => e.StripeWebhookSecret).HasMaxLength(1000);
            entity.Property(e => e.IyzipayApiKey).HasMaxLength(1000);
            entity.Property(e => e.IyzipaySecretKey).HasMaxLength(1000);
            entity.Property(e => e.IyzipayBaseUrl).HasMaxLength(500);
        });
    }
}
