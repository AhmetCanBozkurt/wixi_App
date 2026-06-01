using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiPlatformPaymentSetting : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Stripe — DB'de şifreli saklanır (IPaymentKeyProtector)
    public string? StripeSecretKey { get; set; }
    public string? StripePublishableKey { get; set; }
    public string? StripeWebhookSecret { get; set; }

    // Iyzipay — DB'de şifreli saklanır
    public string? IyzipayApiKey { get; set; }
    public string? IyzipaySecretKey { get; set; }
    public string IyzipayBaseUrl { get; set; } = "https://sandbox-api.iyzipay.com";

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
