namespace Wixi.Modules.Core.Domain.Entities;

public class WixiTeamMemberTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MemberId { get; set; }
    public WixiTeamMember Member { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string Role { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}
