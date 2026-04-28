using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>Ürün kategorisi (hiyerarşik, self-referencing).</summary>
public class WixiCategory : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Üst kategori (null ise kök kategori).</summary>
    public Guid? ParentId { get; set; }
    public WixiCategory? Parent { get; set; }

    public ICollection<WixiCategory> Children { get; set; } = [];

    /// <summary>Kategori adı.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>URL dostu tanımlayıcı.</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Kategori açıklaması.</summary>
    public string? Description { get; set; }

    /// <summary>Kapak görseli URL.</summary>
    public string? ImageUrl { get; set; }

    /// <summary>Sıralama.</summary>
    public int SortOrder { get; set; } = 0;

    /// <summary>SEO meta title.</summary>
    public string? MetaTitle { get; set; }

    /// <summary>SEO meta description.</summary>
    public string? MetaDescription { get; set; }

    public ICollection<WixiProduct> Products { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
