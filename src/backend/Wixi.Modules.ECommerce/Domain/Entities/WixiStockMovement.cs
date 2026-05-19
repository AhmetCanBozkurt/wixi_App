using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum StockMovementType
{
    GRN = 1,  // Goods Receipt Note — mal girisi
    SALE = 2, // Satistan dusme
    RTN = 3,  // Musteri iadesi
    TRF = 4,  // Depo transferi
    ADJ = 5,  // Manuel duzeltme
}

public class WixiStockMovement : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VariantId { get; set; }
    public WixiProductVariant? Variant { get; set; }
    public Guid WarehouseId { get; set; }
    public WixiWarehouse? Warehouse { get; set; }
    public StockMovementType Type { get; set; }
    /// <summary>Pozitif = giris, negatif = cikis.</summary>
    public int Quantity { get; set; }
    public string? Notes { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    /// <summary>TRF tipinde hedef depo.</summary>
    public Guid? ToWarehouseId { get; set; }
    public WixiWarehouse? ToWarehouse { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
