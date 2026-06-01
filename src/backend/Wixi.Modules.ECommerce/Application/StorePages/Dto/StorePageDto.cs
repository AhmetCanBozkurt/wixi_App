using Wixi.Modules.ECommerce.Domain.Enums;

namespace Wixi.Modules.ECommerce.Application.StorePages.Dto;

public class StorePageDto
{
    public Guid Id { get; set; }
    public StorePageType PageType { get; set; }
    public string Slug { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? LayoutConfigJson { get; set; }
    public string? ThemeOverrideJson { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaKeywords { get; set; }
    public string? OpenGraphImageUrl { get; set; }
    public string? BacklinksJson { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
