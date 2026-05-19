using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum OrderStatus
{
    Pending = 0,
    Paid = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    Refunded = 6
}

public class WixiOrder : IAuditable
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string OrderNumber { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    
    // Addresses
    public string ShippingAddress { get; set; } = null!;
    public string BillingAddress { get; set; } = null!;
    
    // Tracking
    public string? TrackingNumber { get; set; }
    public string? ShippingProvider { get; set; }
    
    // Payment info
    public string? PaymentGateway { get; set; }
    public string? PaymentToken { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public virtual WixiCustomer Customer { get; set; } = null!;
    public virtual ICollection<WixiOrderItem> Items { get; set; } = new List<WixiOrderItem>();
}
