using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiUnitConversion : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FromUnitId { get; set; }
    public Guid ToUnitId { get; set; }
    public decimal Factor { get; set; }
    public int SortOrder { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    public WixiUnit? FromUnit { get; set; }
    public WixiUnit? ToUnit { get; set; }
}
