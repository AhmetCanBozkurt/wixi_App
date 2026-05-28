using MediatR;

namespace Wixi.Modules.Core.Application.PaymentSettings.Commands.UpdatePlatformPaymentSettings;

public record UpdatePlatformPaymentSettingsCommand(
    string? StripeSecretKey,
    string? StripePublishableKey,
    string? StripeWebhookSecret,
    string? IyzipayApiKey,
    string? IyzipaySecretKey,
    string? IyzipayBaseUrl
) : IRequest<Unit>;
