namespace Wixi.Modules.Core.Domain.Entities;

public class WixiFaqCategoryTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public WixiFaqCategory Category { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string Label { get; set; } = string.Empty;
}
