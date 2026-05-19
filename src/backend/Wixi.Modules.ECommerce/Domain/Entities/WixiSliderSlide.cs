using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Bir slider'a ait tekil slayt.</summary>
public class WixiSliderSlide : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Bağlı olduğu slider ID'si.</summary>
    public Guid SliderId { get; set; }

    /// <summary>Slayt başlığı.</summary>
    public string? Title { get; set; }

    /// <summary>Slayt alt başlığı.</summary>
    public string? Subtitle { get; set; }

    /// <summary>Slayt resim URL'si.</summary>
    public string ImageUrl { get; set; } = string.Empty;

    /// <summary>Buton metni.</summary>
    public string? ButtonText { get; set; }

    /// <summary>Buton yönlendirme URL'si.</summary>
    public string? ButtonUrl { get; set; }

    /// <summary>Sıralama değeri.</summary>
    public int SortOrder { get; set; } = 0;

    public WixiSlider Slider { get; set; } = null!;

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
