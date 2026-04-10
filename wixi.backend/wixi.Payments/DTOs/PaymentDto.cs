namespace wixi.Payments.DTOs;

/// <summary>
/// Payment DTO for API responses
/// </summary>
public class PaymentDto
{
    public long Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public string PaymentProvider { get; set; } = string.Empty;
    public string? ProviderPaymentId { get; set; }
    public string? ConversationId { get; set; }
    
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerIdentityNumber { get; set; }
    
    public decimal Amount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal? ExchangeRate { get; set; }
    
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    public string? Notes { get; set; }
    
    public long? AppointmentId { get; set; }
    public int? ApplicationId { get; set; }
    public string? RelatedEntityType { get; set; }
    public long? RelatedEntityId { get; set; }
    
    public string? IyzicoPaymentId { get; set; }
    public string? IyzicoConversationId { get; set; }
    public string? IyzicoStatus { get; set; }
    public string? IyzicoErrorCode { get; set; }
    public string? IyzicoErrorMessage { get; set; }
    
    public string? CardLastFourDigits { get; set; }
    public string? CardHolderName { get; set; }
    public string? CardBrand { get; set; }
    public string? CardType { get; set; }
    public int? InstallmentCount { get; set; }
    
    public bool IsInstallment { get; set; }
    public int? InstallmentNumber { get; set; }
    public decimal? InstallmentAmount { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    public List<PaymentItemDto> Items { get; set; } = new();
    public List<PaymentTransactionDto> Transactions { get; set; } = new();
    public List<PaymentRefundDto> Refunds { get; set; } = new();
}

