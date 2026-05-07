namespace Wixi.Modules.Core.Domain.Entities;

public class WixiPaymentTransaction  // NOT IAuditable — payment history must never be soft-deleted
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public WixiTenant Tenant { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string Status { get; set; } = "Pending"; // Pending|Succeeded|Failed|Refunded
    public string Gateway { get; set; } = "Stripe";
    public string? ExternalId { get; set; }
    public string? ExternalSubscriptionId { get; set; }
    public string? FailureReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
