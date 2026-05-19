namespace Wixi.Modules.ECommerce.Application.StoreSettings.Dto;

public class ThemeConfig
{
    public ThemeColors Colors { get; set; } = new();
    public ThemeTypography Typography { get; set; } = new();
    public ThemeSpacing Spacing { get; set; } = new();
    public ThemeBorderRadius BorderRadius { get; set; } = new();
    public ThemeShadows Shadows { get; set; } = new();

    public static ThemeConfig Default() => new();
}

public class ThemeColors
{
    public string Primary { get; set; } = "#ec4899";
    public string PrimaryHover { get; set; } = "#db2777";
    public string Secondary { get; set; } = "#a855f7";
    public string Background { get; set; } = "#ffffff";
    public string Surface { get; set; } = "#f9fafb";
    public string Text { get; set; } = "#111827";
    public string TextMuted { get; set; } = "#6b7280";
    public string Border { get; set; } = "#e5e7eb";
    public string Accent { get; set; } = "#f59e0b";
    public string Success { get; set; } = "#10b981";
    public string Danger { get; set; } = "#ef4444";
}

public class ThemeTypography
{
    public string FontFamily { get; set; } = "Inter, sans-serif";
    public string HeadingFont { get; set; } = "Inter, sans-serif";
    public string BaseFontSize { get; set; } = "16px";
    public string LineHeight { get; set; } = "1.6";
    public string HeadingWeight { get; set; } = "700";
}

public class ThemeSpacing
{
    public string ContainerMaxWidth { get; set; } = "1200px";
    public string SectionPaddingY { get; set; } = "80px";
    public string SectionPaddingX { get; set; } = "24px";
}

public class ThemeBorderRadius
{
    public string Sm { get; set; } = "4px";
    public string Md { get; set; } = "8px";
    public string Lg { get; set; } = "16px";
    public string Button { get; set; } = "8px";
    public string Card { get; set; } = "12px";
}

public class ThemeShadows
{
    public string Card { get; set; } = "0 1px 3px rgba(0,0,0,0.1)";
    public string Button { get; set; } = "none";
}
