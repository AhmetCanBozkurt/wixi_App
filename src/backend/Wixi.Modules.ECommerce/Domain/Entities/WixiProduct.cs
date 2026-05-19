using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>
/// Mağazadaki ürünü temsil eder. Her tenant'ın kendi DB'sinde saklanır.
/// </summary>
public class WixiProduct : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Ürün adı.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>URL dostu ürün tanımlayıcısı. Örn: "erkek-beyaz-gomlek"</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Kısa açıklama (liste görünümünde).</summary>
    public string? ShortDescription { get; set; }

    /// <summary>Uzun HTML açıklama (ürün detay sayfasında).</summary>
    public string? Description { get; set; }

    /// <summary>Kategori ID.</summary>
    public Guid? CategoryId { get; set; }
    public WixiCategory? Category { get; set; }

    /// <summary>Marka ID.</summary>
    public Guid? BrandId { get; set; }
    public WixiBrand? Brand { get; set; }

    /// <summary>Temel fiyat (varyantsız ürünlerde kullanılır).</summary>
    public decimal BasePrice { get; set; }

    /// <summary>İndirimli fiyat (varyantsız ürünlerde).</summary>
    public decimal? CompareAtPrice { get; set; }

    /// <summary>KDV oranı (%). Geçerli değerler: 0, 1, 8, 10, 18, 20</summary>
    public int VatRate { get; set; } = 20;

    /// <summary>Alış/maliyet fiyatı (iç kullanım, müşteriye gösterilmez).</summary>
    public decimal? CostPrice { get; set; }

    /// <summary>Stok takip edilsin mi?</summary>
    public bool TrackInventory { get; set; } = true;

    /// <summary>Varyantlar (renk, beden vb.).</summary>
    public ICollection<WixiProductVariant> Variants { get; set; } = [];

    /// <summary>Ürün görselleri.</summary>
    public ICollection<WixiProductMedia> Media { get; set; } = [];

    /// <summary>SEO meta title.</summary>
    public string? MetaTitle { get; set; }

    /// <summary>SEO meta description.</summary>
    public string? MetaDescription { get; set; }

    /// <summary>Öne çıkan ürün — homepage/featured blocks için.</summary>
    public bool IsFeatured { get; set; } = false;

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
