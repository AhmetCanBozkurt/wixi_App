namespace Wixi.Modules.Core.Domain.Entities;

public class WixiCompanyMilestoneTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MilestoneId { get; set; }
    public WixiCompanyMilestone Milestone { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}
