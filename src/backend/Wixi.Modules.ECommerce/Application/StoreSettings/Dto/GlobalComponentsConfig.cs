namespace Wixi.Modules.ECommerce.Application.StoreSettings.Dto;

public record NavbarConfig(
    string Layout,           // "classic" | "centered" | "mega"
    string LogoPosition,     // "left" | "center"
    bool IsSticky,
    bool ShowSearch,
    bool ShowLanguagePicker
);

public record FooterConfig(
    int ColumnCount,         // 1-4
    bool ShowSocials,
    bool ShowNewsletter,
    string CopyrightText
);

public record GlobalComponentsConfig(
    NavbarConfig Navbar,
    FooterConfig Footer
);
