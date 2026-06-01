using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum LoyaltyPointType { Earned = 1, Spent = 2, Expired = 3, Adjusted = 4 }

public class WixiLoyaltyPoint : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public LoyaltyPointType Type { get; set; }
    public int Points { get; set; }
    public string? Description { get; set; }
    public Guid? ReferenceOrderId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
