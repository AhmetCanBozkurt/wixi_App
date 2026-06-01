using Wixi.Modules.ECommerce.Domain.Entities;

namespace Wixi.Modules.ECommerce.Application.Orders.Dto;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = null!;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string CustomerEmail { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public OrderStatus Status { get; set; }
    public string ShippingAddress { get; set; } = null!;
    public string BillingAddress { get; set; } = null!;
    public string? TrackingNumber { get; set; }
    public string? ShippingProvider { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? VariantName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
