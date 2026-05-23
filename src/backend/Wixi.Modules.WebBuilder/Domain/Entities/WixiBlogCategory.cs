using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.WebBuilder.Domain.Entities;

public class WixiBlogCategory : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 0;

    // IAuditable
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
