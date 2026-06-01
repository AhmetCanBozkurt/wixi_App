namespace Wixi.Modules.Core.Domain.Entities;

public class WixiCaseStudyTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseStudyId { get; set; }
    public WixiCaseStudy CaseStudy { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string ClientName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Metric1Label { get; set; } = string.Empty;
    public string Metric2Label { get; set; } = string.Empty;
    public string? QuoteText { get; set; }
    public string? QuoteAuthor { get; set; }
}
