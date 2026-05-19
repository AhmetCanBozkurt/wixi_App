namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiOrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? VariantId { get; set; }
    
    public string ProductName { get; set; } = null!;
    public string? VariantName { get; set; }
    public string? SKU { get; set; }
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Navigation
    public virtual WixiOrder Order { get; set; } = null!;
    public virtual WixiProduct Product { get; set; } = null!;
    public virtual WixiProductVariant? Variant { get; set; }
}
