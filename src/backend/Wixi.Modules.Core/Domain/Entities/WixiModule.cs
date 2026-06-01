using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiModule : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>Modülün benzersiz kodu (örn: ecommerce, crm, notes)</summary>
    public string Code { get; set; } = string.Empty;
    
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    
    /// <summary>Müşterilere açık bir modül mü? (False ise sadece sistem adminleri görebilir)</summary>
    public bool IsPublic { get; set; } = true;

    public decimal? PriceMonthly { get; set; }
    public decimal? PriceYearly { get; set; }

    /// <summary>JSON array of feature strings, e.g. ["Ürün kataloğu","Stok takibi"]</summary>
    public string? FeaturesJson { get; set; }

    /// <summary>CSS color accent, e.g. "#38bdf8"</summary>
    public string? ColorAccent { get; set; }

    public bool IsPopular { get; set; } = false;
    public int SortOrder { get; set; } = 0;

    /// <summary>Modülün kategorisi: satis | ik | finans | stok | destek | uretim | verim</summary>
    public string? Category { get; set; }

    /// <summary>Öne çıkan rozet: popular | new | beta | null</summary>
    public string? Tag { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
