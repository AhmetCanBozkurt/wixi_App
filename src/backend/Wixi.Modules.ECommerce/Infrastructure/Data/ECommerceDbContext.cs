using Microsoft.EntityFrameworkCore;
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
    }
}
