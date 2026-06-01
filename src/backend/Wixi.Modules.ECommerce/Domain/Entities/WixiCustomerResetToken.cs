namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiCustomerResetToken
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string TokenHash { get; set; } = null!;   // SHA256 hex
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? IpAddress { get; set; }

    public WixiCustomer Customer { get; set; } = null!;
}
