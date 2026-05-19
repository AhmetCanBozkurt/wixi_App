namespace Wixi.Modules.ECommerce.Application.StoreSettings.Dto;

public class StoreSettingsDto
{
    public Guid Id { get; set; }
    public string StoreName { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public string? SocialLinksJson { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? Keywords { get; set; }
    public string? ThemeConfigJson { get; set; }
    public string? LayoutConfigJson { get; set; }
    public string? GlobalComponentsConfigJson { get; set; }
    public string? CustomCssOverride { get; set; }
    public string? CustomJsOverride { get; set; }
    public string? SupportedLanguages { get; set; }
    public string? DefaultLanguage { get; set; }
}
