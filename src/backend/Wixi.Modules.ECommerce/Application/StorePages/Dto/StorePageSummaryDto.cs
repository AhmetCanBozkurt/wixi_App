using Wixi.Modules.ECommerce.Domain.Enums;

namespace Wixi.Modules.ECommerce.Application.StorePages.Dto;

public class StorePageSummaryDto
{
    public Guid Id { get; set; }
    public StorePageType PageType { get; set; }
    public string Slug { get; set; } = null!;
    public string Title { get; set; } = null!;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
