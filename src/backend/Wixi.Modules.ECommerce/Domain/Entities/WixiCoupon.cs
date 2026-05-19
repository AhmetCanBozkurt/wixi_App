using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum DiscountType { Percent = 1, FixedAmount = 2, FreeShipping = 3 }

public class WixiCoupon : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;       // unique, uppercase
    public string Name { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; } = DiscountType.Percent;
    public decimal DiscountValue { get; set; }              // % or TRY amount
    public decimal? MinOrderAmount { get; set; }
    public int? MaxUsageTotal { get; set; }                 // null = unlimited
    public int? MaxUsagePerCustomer { get; set; }
    public int CurrentUsage { get; set; } = 0;
    public DateTime? StartsAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
