namespace wixi.Payments.DTOs;

/// <summary>
/// Payment Refund DTO
/// </summary>
public class PaymentRefundDto
{
    public long Id { get; set; }
    public string RefundNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string Status { get; set; } = string.Empty; // Enum as string
    public string? IyzicoRefundId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? RefundedByUserId { get; set; }
}

