namespace Wixi.Modules.Core.Domain.Entities;

public class WixiTenantSubscription  // NOT IAuditable — subscription history must never be soft-deleted
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public WixiTenant Tenant { get; set; } = null!;
    public Guid PlanId { get; set; }
    public WixiSubscriptionPlan Plan { get; set; } = null!;
    public string Status { get; set; } = "Trial"; // Trial|Active|Cancelled|PastDue
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public string BillingInterval { get; set; } = "Monthly";
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
