using wixi.Appointments.Entities;

namespace wixi.Payments.Entities;

/// <summary>
/// Represents a payment transaction in the system
/// </summary>
public class Payment
{
    public long Id { get; set; }
    
    // Payment Number (Unique identifier)
    public string PaymentNumber { get; set; } = string.Empty;
    
    // Provider Information
    public string PaymentProvider { get; set; } = "Iyzico";
    public string? ProviderPaymentId { get; set; }  // Iyzico PaymentId
    public string? ConversationId { get; set; }      // Iyzico ConversationId
    
    // Customer Information
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerIdentityNumber { get; set; }
    
    // Amount Information
    public decimal Amount { get; set; }              // Payment amount
    public decimal PaidAmount { get; set; }          // Amount paid
    public string Currency { get; set; } = "EUR";   // EUR, TRY, USD
    public decimal? ExchangeRate { get; set; }       // Exchange rate if applicable
    
    // Status Information
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentType Type { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.CreditCard;
    
    // Description
    public string? Description { get; set; }
    public string? Notes { get; set; }
    
    // Relations
    public long? AppointmentId { get; set; }
    public virtual Appointment? Appointment { get; set; }
    
    public int? ApplicationId { get; set; }
    public string? RelatedEntityType { get; set; }  // "Appointment", "Application"
    public long? RelatedEntityId { get; set; }
    
    // Iyzico Specific Fields
    public string? IyzicoPaymentId { get; set; }
    public string? IyzicoConversationId { get; set; }
    public string? IyzicoStatus { get; set; }        // "SUCCESS", "FAILURE"
    public string? IyzicoErrorCode { get; set; }
    public string? IyzicoErrorMessage { get; set; }
    public string? IyzicoRawResponse { get; set; }  // JSON response
    
    // Card Information (Masked - PCI-DSS compliant)
    public string? CardLastFourDigits { get; set; }  // "1234"
    public string? CardHolderName { get; set; }
    public string? CardBrand { get; set; }           // "VISA", "MASTERCARD"
    public string? CardType { get; set; }            // "CREDIT", "DEBIT"
    public int? InstallmentCount { get; set; }        // Installment count
    
    // Installment Information
    public bool IsInstallment { get; set; } = false;
    public int? InstallmentNumber { get; set; }
    public decimal? InstallmentAmount { get; set; }
    
    // CV Builder specific
    public Guid? CVBuilderSessionId { get; set; }  // CV Builder session ID
    
    // Dates
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    // Navigation Properties
    public virtual ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();
    public virtual ICollection<PaymentItem> Items { get; set; } = new List<PaymentItem>();
    public virtual ICollection<PaymentRefund> Refunds { get; set; } = new List<PaymentRefund>();
}

/// <summary>
/// Payment status enum
/// </summary>
public enum PaymentStatus
{
    Pending = 1,      // Beklemede
    Completed = 2,     // Tamamlandı
    Failed = 3,        // Başarısız
    Cancelled = 4,     // İptal edildi
    Refunded = 5      // İade edildi
}

/// <summary>
/// Payment type enum
/// </summary>
public enum PaymentType
{
    Appointment = 1,   // Randevu ödemesi
    Application = 2,   // Başvuru ödemesi
    Service = 3,       // Hizmet ödemesi
    CVBuilder = 4,    // CV Builder ödemesi
    EquivalencyFee = 5 // Denklik ücreti ödemesi
}

/// <summary>
/// Payment method enum
/// </summary>
public enum PaymentMethod
{
    CreditCard = 1,    // Kredi kartı
    BankTransfer = 2, // Banka transferi
    Other = 3          // Diğer
}

