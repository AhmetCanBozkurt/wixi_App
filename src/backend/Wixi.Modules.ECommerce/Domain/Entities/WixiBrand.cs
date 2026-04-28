using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Ürün markası.</summary>
public class WixiBrand : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Marka adı.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>URL dostu tanımlayıcı.</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Marka açıklaması.</summary>
    public string? Description { get; set; }

    /// <summary>Marka logo URL.</summary>
    public string? LogoUrl { get; set; }

    /// <summary>Web sitesi adresi.</summary>
    public string? WebsiteUrl { get; set; }

    public ICollection<WixiProduct> Products { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
