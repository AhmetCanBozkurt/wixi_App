using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiStoreSettings : IAuditable
{
    public Guid Id { get; set; }
    
    // General
    public string StoreName { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    
    // Contact
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    
    // Social
    public string? SocialLinksJson { get; set; } // Store Facebook, Instagram, etc as JSON
    
    // SEO
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? Keywords { get; set; }

    // Storefront Customization
    public string? ThemeConfigJson { get; set; } // Colors, Fonts, Global Styles
    public string? LayoutConfigJson { get; set; } // Home page components, order, properties

    // Theme Editor — Global Components & Custom Code
    public string? GlobalComponentsConfigJson { get; set; } // Navbar/Footer config JSON
    public string? CustomCssOverride { get; set; }          // Store-wide custom CSS
    public string? CustomJsOverride { get; set; }            // Store-wide custom JS snippets

    // Language
    public string? SupportedLanguages { get; set; } // JSON array: ["tr","en"]
    public string? DefaultLanguage { get; set; } = "tr";

    // IAuditable
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
