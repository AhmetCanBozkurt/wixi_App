namespace wixi.Payments.Entities;

/// <summary>
/// Represents a payment item (basket item)
/// </summary>
public class PaymentItem
{
    public long Id { get; set; }
    public long PaymentId { get; set; }
    public virtual Payment Payment { get; set; } = null!;
    
    // Item Information
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    
    // Relation
    public string? RelatedEntityType { get; set; }  // "Appointment", "Service"
    public long? RelatedEntityId { get; set; }
}

