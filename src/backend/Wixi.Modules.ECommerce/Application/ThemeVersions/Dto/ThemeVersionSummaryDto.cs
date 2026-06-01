namespace Wixi.Modules.ECommerce.Application.ThemeVersions.Dto;

public class ThemeVersionSummaryDto
{
    public int Id { get; set; }
    public int VersionNumber { get; set; }
    public string? VersionLabel { get; set; }
    public string VersionType { get; set; } = "auto";
    public bool IsPublished { get; set; }
    public int? RestoredFromVersionId { get; set; }
    public string? ChangedByEmail { get; set; }
    public DateTime CreatedAt { get; set; }
}
