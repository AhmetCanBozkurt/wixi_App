namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum PaymentLogStatus
{
    Initiated = 0,
    Success = 1,
    Failed = 2,
    Cancelled = 3
}

public class WixiPaymentLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string Gateway { get; set; } = "Iyzipay";
    public string ConversationId { get; set; } = null!;
    public string? Token { get; set; }
    public string? PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public PaymentLogStatus Status { get; set; } = PaymentLogStatus.Initiated;
    public string? ErrorMessage { get; set; }
    public string? RawResponse { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public virtual WixiOrder Order { get; set; } = null!;
}
