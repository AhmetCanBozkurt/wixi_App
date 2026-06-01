using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiThemeTemplate : IAuditable
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? PreviewImageUrl { get; set; }
    public string? ThemeConfigJson { get; set; }
    public string? GlobalComponentsConfigJson { get; set; }
    public string? CustomCssOverride { get; set; }
    public bool IsDefault { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
