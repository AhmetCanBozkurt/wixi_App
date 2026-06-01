using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.WebBuilder.Domain.Entities;

public class WixiBlogPost : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? ContentHtml { get; set; }
    public string? FeaturedImageUrl { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Tags { get; set; } // CSV
    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; }
    public string? AuthorName { get; set; }
    public int ReadTimeMinutes { get; set; } = 0;

    // IAuditable
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
