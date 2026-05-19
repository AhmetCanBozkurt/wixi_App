using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Tanıtım / promosyon banner'ı.</summary>
public class WixiPromoBanner : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Banner başlığı.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Alt başlık.</summary>
    public string? Subtitle { get; set; }

    /// <summary>Banner resim URL'si.</summary>
    public string? ImageUrl { get; set; }

    /// <summary>Buton metni.</summary>
    public string? ButtonText { get; set; }

    /// <summary>Buton yönlendirme URL'si.</summary>
    public string? ButtonUrl { get; set; }

    /// <summary>Arka plan rengi (hex).</summary>
    public string? BackgroundColor { get; set; }

    /// <summary>Metin rengi (hex).</summary>
    public string? TextColor { get; set; }

    /// <summary>Düzen tipi: "overlay" | "split" | "simple".</summary>
    public string Layout { get; set; } = "overlay";

    /// <summary>Sıralama değeri.</summary>
    public int SortOrder { get; set; } = 0;

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
