using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Ürün görseli.</summary>
public class WixiProductMedia : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public WixiProduct? Product { get; set; }

    /// <summary>Belirli bir varyanta aitse (null ise tüm ürüne ait).</summary>
    public Guid? VariantId { get; set; }

    /// <summary>Dosya URL (CDN veya local storage).</summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>Küçük resim URL (thumbnail).</summary>
    public string? ThumbnailUrl { get; set; }

    /// <summary>SEO alt metni.</summary>
    public string? AltText { get; set; }

    /// <summary>Medya türü.</summary>
    public ProductMediaType MediaType { get; set; } = ProductMediaType.Image;

    /// <summary>Sıralama. 0 = kapak fotoğrafı.</summary>
    public int SortOrder { get; set; } = 0;

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}

public enum ProductMediaType
{
    Image = 0,
    Video = 1
}
