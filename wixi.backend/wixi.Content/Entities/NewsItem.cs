namespace wixi.Content.Entities;

/// <summary>
/// News Item - Blog/Haber sistemi
/// Multi-language support for DE, TR, EN, AR
/// </summary>
public class NewsItem
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Multi-language Title
    public string TitleDe { get; set; } = string.Empty;
    public string TitleTr { get; set; } = string.Empty;
    public string? TitleEn { get; set; }
    public string? TitleAr { get; set; }
    
    // Multi-language Excerpt
    public string ExcerptDe { get; set; } = string.Empty;
    public string ExcerptTr { get; set; } = string.Empty;
    public string? ExcerptEn { get; set; }
    public string? ExcerptAr { get; set; }
    
    // Multi-language Content
    public string? ContentDe { get; set; }
    public string? ContentTr { get; set; }
    public string? ContentEn { get; set; }
    public string? ContentAr { get; set; }
    
    // Image
    public string ImageUrl { get; set; } = string.Empty;
    
    // Category
    public string Category { get; set; } = string.Empty;
    
    // Featured/Öne Çıkan
    public bool Featured { get; set; } = false;
    
    // Publishing
    public DateTime? PublishedAt { get; set; }
    
    // Slug for detail page (SEO-friendly URL)
    public string? Slug { get; set; }
    
    // Ordering
    public int DisplayOrder { get; set; } = 0;
    
    // Status
    public bool IsActive { get; set; } = true;
}

