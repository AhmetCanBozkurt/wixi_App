namespace Wixi.Modules.WebBuilder.Domain.Entities;

public class WixiCorpPageVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PageId { get; set; }
    public Guid TenantId { get; set; }
    public string? LayoutConfigJson { get; set; }
    public string? ThemeOverrideJson { get; set; }
    public string? CheckpointLabel { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
}
