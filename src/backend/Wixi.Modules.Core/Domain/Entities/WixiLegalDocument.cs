using Wixi.Shared.Domain.Entities;
namespace Wixi.Modules.Core.Domain.Entities;

public class WixiLegalDocument : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Slug { get; set; } = string.Empty;    // "privacy" | "kvkk" | "terms" | "cookies"
    public string Version { get; set; } = string.Empty;  // "3.2"
    public DateOnly EffectiveDate { get; set; }
    public ICollection<WixiLegalDocumentTranslation> Translations { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
