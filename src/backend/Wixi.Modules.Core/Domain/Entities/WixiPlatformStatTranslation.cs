namespace Wixi.Modules.Core.Domain.Entities;

public class WixiPlatformStatTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StatId { get; set; }
    public WixiPlatformStat Stat { get; set; } = null!;
    public Guid LanguageId { get; set; }
    public WixiLanguage Language { get; set; } = null!;
    public string Label { get; set; } = string.Empty;  // 'Aktif İşletme' / 'Active Businesses'
}
