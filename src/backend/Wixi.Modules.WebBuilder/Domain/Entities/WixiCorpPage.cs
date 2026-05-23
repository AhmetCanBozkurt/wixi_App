using Wixi.Modules.WebBuilder.Domain.Enums;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.WebBuilder.Domain.Entities;

public class WixiCorpPage : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public CorpPageType PageType { get; set; } = CorpPageType.Custom;
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? LayoutConfigJson { get; set; }
    public string? ThemeOverrideJson { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaKeywords { get; set; }
    public string? OpenGraphImageUrl { get; set; }
    public string? BacklinksJson { get; set; }
    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
