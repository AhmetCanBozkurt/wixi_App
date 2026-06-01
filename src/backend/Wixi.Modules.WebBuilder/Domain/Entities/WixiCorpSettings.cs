using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.WebBuilder.Domain.Entities;

public class WixiCorpSettings : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string? GlobalComponentsConfigJson { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
