using MediatR;

namespace Wixi.Modules.ECommerce.Application.Orders.Commands.HandlePaymentCallback;

public record HandlePaymentCallbackCommand(string Token, string? Status) : IRequest<HandlePaymentCallbackResult>;

public record HandlePaymentCallbackResult(bool Paid, string OrderNumber, string? Error);
