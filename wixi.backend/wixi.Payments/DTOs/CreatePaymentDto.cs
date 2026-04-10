using System.Text.Json.Serialization;

namespace wixi.Payments.DTOs;

/// <summary>
/// DTO for creating a payment
/// </summary>
public class CreatePaymentDto
{
    // Payment Information
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    
    [JsonPropertyName("type")]
    public string PaymentType { get; set; } = "Appointment";  // "Appointment", "Application", "Service", "EquivalencyFee"
    
    // Customer Information
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerIdentityNumber { get; set; }
    
    // Card Information (from frontend)
    public string CardNumber { get; set; } = string.Empty;
    public string CardHolder { get; set; } = string.Empty;
    public string ExpireMonth { get; set; } = string.Empty;
    public string ExpireYear { get; set; } = string.Empty;
    public string Cvc { get; set; } = string.Empty;
    public int? Installment { get; set; } = 1;  // Installment count (1 = peşin)
    
    // Relations
    public long? AppointmentId { get; set; }
    public int? ApplicationId { get; set; }
    public string? RelatedEntityType { get; set; }
    public long? RelatedEntityId { get; set; }
    
    // Additional Information
    public string? Description { get; set; }
    public string? Notes { get; set; }
    
    // Customer Address (for Iyzico)
    public string? CustomerCity { get; set; }
    public string? CustomerCountry { get; set; } = "Turkey";
    public string? CustomerZipCode { get; set; }
    public string? CustomerAddress { get; set; }
}

