namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiThemeVersion
{
    public int Id { get; set; }
    public Guid StoreSettingsId { get; set; }
    public int VersionNumber { get; set; }

    // Full snapshot
    public string? ThemeConfigJson { get; set; }
    public string? GlobalComponentsConfigJson { get; set; }
    public string? CustomCssOverride { get; set; }
    public string? CustomJsOverride { get; set; }

    // Metadata
    public string? VersionLabel { get; set; }
    public string VersionType { get; set; } = "auto"; // auto | checkpoint | rollback
    public bool IsPublished { get; set; }
    public int? RestoredFromVersionId { get; set; }
    public string? ChangedByEmail { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public WixiStoreSettings? StoreSettings { get; set; }
}
