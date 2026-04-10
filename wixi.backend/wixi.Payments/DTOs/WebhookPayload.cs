namespace wixi.Payments.DTOs;

/// <summary>
/// Iyzico webhook payload DTO
/// </summary>
public class WebhookPayload
{
    public string? IyziEventType { get; set; }
    public string? IyziPaymentId { get; set; }
    public string? PaymentId { get; set; }
    public string? Token { get; set; }
    public string? PaymentConversationId { get; set; }
    public string? Status { get; set; }
    public string? Signature { get; set; }
    
    // Additional webhook data
    public Dictionary<string, object>? Data { get; set; }
}

