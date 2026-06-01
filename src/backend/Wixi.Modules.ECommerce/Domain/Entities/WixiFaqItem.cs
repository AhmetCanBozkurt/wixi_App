using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Sık sorulan sorular öğesi.</summary>
public class WixiFaqItem : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Soru metni.</summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>Cevap metni.</summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>Opsiyonel gruplama kategorisi.</summary>
    public string? Category { get; set; }

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
