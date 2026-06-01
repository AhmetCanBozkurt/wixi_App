namespace Wixi.Modules.Core.Domain.Entities;

public class WixiChangelogTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EntryId { get; set; }
    public WixiChangelogEntry Entry { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
