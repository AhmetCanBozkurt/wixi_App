namespace Wixi.Modules.Core.Domain.Entities;

public class WixiPlatformStat
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string StatKey { get; set; } = string.Empty;  // 'active_tenants', 'total_transactions', 'uptime', 'avg_growth', 'satisfaction'
    public string DisplayValue { get; set; } = string.Empty;  // '1.250+', '%287', '4.9★'
    public bool AutoCompute { get; set; } = false;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<WixiPlatformStatTranslation> Translations { get; set; } = [];
}
