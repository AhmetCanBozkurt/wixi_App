using MediatR;

namespace Wixi.Modules.ECommerce.Application.Orders.Commands.InitiatePayment;

public record InitiatePaymentCommand(
    Guid OrderId,
    Guid CustomerId,
    string BuyerName,
    string BuyerSurname,
    string BuyerEmail,
    string? BuyerPhone,
    string CallbackUrl
) : IRequest<InitiatePaymentResult>;

public record InitiatePaymentResult(bool Success, string? CheckoutFormContent, string? Token, string? Error);
