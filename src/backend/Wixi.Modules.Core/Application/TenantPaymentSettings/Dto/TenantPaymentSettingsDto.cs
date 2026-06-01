namespace Wixi.Modules.Core.Application.TenantPaymentSettings.Dto;

public record TenantPaymentSettingsDto(
    string ActiveGateway,

    // Stripe
    bool HasStripeSecretKey,
    string? StripeSecretKeyHint,
    string? StripePublishableKey,
    bool HasStripeWebhookSecret,
    string? StripeWebhookSecretHint,

    // Iyzipay
    bool HasIyzipayApiKey,
    string? IyzipayApiKeyHint,
    bool HasIyzipaySecretKey,
    string? IyzipaySecretKeyHint,
    string IyzipayBaseUrl
);
