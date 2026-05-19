namespace Wixi.Modules.ECommerce.Application.ThemeVersions.Dto;

public class ThemeVersionDetailDto : ThemeVersionSummaryDto
{
    public string? ThemeConfigJson { get; set; }
    public string? GlobalComponentsConfigJson { get; set; }
    public string? CustomCssOverride { get; set; }
    public string? CustomJsOverride { get; set; }
}
