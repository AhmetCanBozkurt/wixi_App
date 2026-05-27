using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiCaseStudy : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ClientSlug { get; set; } = string.Empty;
    public string ClientInitials { get; set; } = string.Empty;
    public string? ClientLogoUrl { get; set; }
    public string Industry { get; set; } = string.Empty;
    public string Metric1Value { get; set; } = string.Empty;
    public string Metric2Value { get; set; } = string.Empty;
    public bool IsFeatured { get; set; } = false;
    public int SortOrder { get; set; }
    public ICollection<WixiCaseStudyTranslation> Translations { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
