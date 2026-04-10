namespace wixi.Payments.Entities;

/// <summary>
/// Represents a payment refund
/// </summary>
public class PaymentRefund
{
    public long Id { get; set; }
    public long PaymentId { get; set; }
    public virtual Payment Payment { get; set; } = null!;
    
    // Refund Information
    public string RefundNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public string? Reason { get; set; }
    public RefundStatus Status { get; set; } = RefundStatus.Pending;
    
    // Iyzico Information
    public string? IyzicoRefundId { get; set; }
    public string? IyzicoResponse { get; set; }
    
    // Dates
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int? RefundedByUserId { get; set; }  // Admin user ID
}

/// <summary>
/// Refund status enum
/// </summary>
public enum RefundStatus
{
    Pending = 1,      // Beklemede
    Completed = 2,    // Tamamlandı
    Failed = 3        // Başarısız
}

