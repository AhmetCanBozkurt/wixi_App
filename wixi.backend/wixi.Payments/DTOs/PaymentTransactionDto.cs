namespace wixi.Payments.DTOs;

/// <summary>
/// Payment transaction DTO
/// </summary>
public class PaymentTransactionDto
{
    public long Id { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

