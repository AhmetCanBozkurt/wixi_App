using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Slayt gösterisi (slider) konteyneri.</summary>
public class WixiSlider : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Dahili etiket adı.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Otomatik oynatma aktif mi?</summary>
    public bool AutoPlay { get; set; } = true;

    /// <summary>Otomatik oynatma aralığı (ms).</summary>
    public int AutoPlayInterval { get; set; } = 4000;

    /// <summary>Nokta navigasyonu gösterilsin mi?</summary>
    public bool ShowDots { get; set; } = true;

    /// <summary>Ok navigasyonu gösterilsin mi?</summary>
    public bool ShowArrows { get; set; } = true;

    public ICollection<WixiSliderSlide> Slides { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
