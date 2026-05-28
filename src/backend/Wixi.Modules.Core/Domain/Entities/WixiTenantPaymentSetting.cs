namespace Wixi.Modules.Core.Domain.Entities;

/// <summary>
/// Her tenant'ın kendi DB'sinde (WIXI_EC_PAYMENT_SETTINGS) saklanır.
/// Master DB'de bu entity yoktur — izolasyon tenant DB'nin kendisidir.
/// </summary>
public class WixiTenantPaymentSetting
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>"iyzipay" | "stripe" | "platform_default"</summary>
    public string ActiveGateway { get; set; } = "platform_default";

    // Stripe — şifreli (IPaymentKeyProtector)
    public string? StripeSecretKey { get; set; }
    public string? StripePublishableKey { get; set; }
    public string? StripeWebhookSecret { get; set; }

    // Iyzipay — şifreli
    public string? IyzipayApiKey { get; set; }
    public string? IyzipaySecretKey { get; set; }
    public string IyzipayBaseUrl { get; set; } = "https://sandbox-api.iyzipay.com";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
