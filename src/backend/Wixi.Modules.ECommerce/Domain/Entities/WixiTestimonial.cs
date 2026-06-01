using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Müşteri yorumu / referansı.</summary>
public class WixiTestimonial : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Yorumu yapan müşterinin adı.</summary>
    public string CustomerName { get; set; } = string.Empty;

    /// <summary>Müşterinin unvanı, örn. "CEO, Şirket X".</summary>
    public string? CustomerTitle { get; set; }

    /// <summary>Müşteri avatar resim URL'si.</summary>
    public string? CustomerAvatarUrl { get; set; }

    /// <summary>Yorum metni.</summary>
    public string Quote { get; set; } = string.Empty;

    /// <summary>Değerlendirme puanı (1-5).</summary>
    public int Rating { get; set; } = 5;

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
