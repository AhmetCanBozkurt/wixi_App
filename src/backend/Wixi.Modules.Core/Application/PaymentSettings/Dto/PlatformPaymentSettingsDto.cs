namespace Wixi.Modules.Core.Application.PaymentSettings.Dto;

public record PlatformPaymentSettingsDto(
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
