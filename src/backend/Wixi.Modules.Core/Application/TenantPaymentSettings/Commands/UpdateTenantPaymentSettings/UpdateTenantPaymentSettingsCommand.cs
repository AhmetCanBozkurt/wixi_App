using MediatR;

namespace Wixi.Modules.Core.Application.TenantPaymentSettings.Commands.UpdateTenantPaymentSettings;

public record UpdateTenantPaymentSettingsCommand(
    Guid TenantId,
    string ActiveGateway,
    string? StripeSecretKey,
    string? StripePublishableKey,
    string? StripeWebhookSecret,
    string? IyzipayApiKey,
    string? IyzipaySecretKey,
    string? IyzipayBaseUrl
) : IRequest<Unit>;
