namespace Wixi.Modules.Core.Domain.Entities;

public class WixiFaqTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FaqId { get; set; }
    public WixiFaq Faq { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}
