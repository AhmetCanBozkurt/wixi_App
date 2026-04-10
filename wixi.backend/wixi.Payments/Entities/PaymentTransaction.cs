namespace wixi.Payments.Entities;

/// <summary>
/// Represents a payment transaction record
/// </summary>
public class PaymentTransaction
{
    public long Id { get; set; }
    public long PaymentId { get; set; }
    public virtual Payment Payment { get; set; } = null!;
    
    // Transaction Information
    public string TransactionId { get; set; } = string.Empty;  // Iyzico Transaction ID
    public TransactionType Type { get; set; }
    public TransactionStatus Status { get; set; }
    
    // Amount
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    
    // Iyzico Response
    public string? IyzicoResponse { get; set; }  // JSON response
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    
    // Dates
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Transaction type enum
/// </summary>
public enum TransactionType
{
    Payment = 1,       // Ödeme
    Refund = 2,        // İade
    Cancel = 3         // İptal
}

/// <summary>
/// Transaction status enum
/// </summary>
public enum TransactionStatus
{
    Pending = 1,       // Beklemede
    Success = 2,       // Başarılı
    Failed = 3         // Başarısız
}

