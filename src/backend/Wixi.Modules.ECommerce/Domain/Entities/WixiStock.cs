namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiStock
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VariantId { get; set; }
    public WixiProductVariant? Variant { get; set; }
    public Guid WarehouseId { get; set; }
    public WixiWarehouse? Warehouse { get; set; }
    public int Quantity { get; set; } = 0;
    public int ReservedQuantity { get; set; } = 0;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
