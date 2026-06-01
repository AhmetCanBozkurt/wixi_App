namespace Wixi.Modules.Core.Domain.Entities;

public class WixiLegalDocumentTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public WixiLegalDocument Document { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string ContentHtml { get; set; } = string.Empty;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
}
