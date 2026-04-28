using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Ürün varyantı (Renk: Kırmızı + Beden: L gibi kombinasyonlar).</summary>
public class WixiProductVariant : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public WixiProduct? Product { get; set; }

    /// <summary>Varyant adı. Örn: "Kırmızı / L"</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Benzersiz stok kodu.</summary>
    public string SKU { get; set; } = string.Empty;

    /// <summary>Barkod (EAN/UPC vb.).</summary>
    public string? Barcode { get; set; }

    /// <summary>Varyant fiyatı (ürün base price'ını override eder).</summary>
    public decimal Price { get; set; }

    /// <summary>İndirimli fiyat.</summary>
    public decimal? CompareAtPrice { get; set; }

    /// <summary>Mevcut stok adedi.</summary>
    public int StockQuantity { get; set; } = 0;

    /// <summary>Rezerve edilmiş stok (sepetteki siparişler için).</summary>
    public int ReservedQuantity { get; set; } = 0;

    /// <summary>Stok uyarı eşiği. Bu değerin altına düşünce bildirim gönder.</summary>
    public int LowStockThreshold { get; set; } = 5;

    /// <summary>Ağırlık (kargo hesabı için, gram).</summary>
    public decimal? WeightGrams { get; set; }

    /// <summary>Varyant özellikleri. Örn: {"Renk": "Kırmızı", "Beden": "L"}</summary>
    public string AttributesJson { get; set; } = "{}";

    /// <summary>Varyant sıralama.</summary>
    public int SortOrder { get; set; } = 0;

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
