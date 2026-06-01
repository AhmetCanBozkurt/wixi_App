using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiFaqCategory : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Slug { get; set; } = string.Empty;  // 'genel', 'fiyatlandirma', 'teknik', 'guvenlik', 'entegrasyon'
    public int SortOrder { get; set; }
    public ICollection<WixiFaqCategoryTranslation> Translations { get; set; } = [];
    public ICollection<WixiFaq> Faqs { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
