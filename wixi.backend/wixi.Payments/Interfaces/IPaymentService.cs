using wixi.Payments.DTOs;

namespace wixi.Payments.Interfaces;

/// <summary>
/// Payment service interface
/// </summary>
public interface IPaymentService
{
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto, string? clientIp = null);
    Task<PaymentDto?> GetPaymentAsync(long paymentId);
    Task<PaymentDto?> GetPaymentByNumberAsync(string paymentNumber);
    Task<PaymentDto?> GetPaymentByIyzicoPaymentIdAsync(string iyzicoPaymentId);
    Task<List<PaymentDto>> GetPaymentsByAppointmentIdAsync(long appointmentId);
    Task<bool> CancelPaymentAsync(long paymentId, string? reason = null);
    Task<bool> RefundPaymentAsync(long paymentId, decimal amount, string? reason = null);
    Task ProcessWebhookAsync(WebhookPayload payload);
}

