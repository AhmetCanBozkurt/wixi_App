using Wixi.Modules.ECommerce.Domain.Enums;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiStorePage : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public StorePageType PageType { get; set; } = StorePageType.Custom;

    /// <summary>URL dostu benzersiz tanımlayıcı. Örn: "hakkimizda", "iletisim"</summary>
    public string Slug { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    /// <summary>Bileşen dizisi JSON — [{ id, type, props }]</summary>
    public string? LayoutConfigJson { get; set; }

    /// <summary>Bu sayfaya özgü tema override — global ThemeConfigJson üzerine yazar</summary>
    public string? ThemeOverrideJson { get; set; }

    // SEO
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaKeywords { get; set; }
    public string? OpenGraphImageUrl { get; set; }

    /// <summary>İç/dış bağlantılar — [{ url, anchorText, noFollow }]</summary>
    public string? BacklinksJson { get; set; }

    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
