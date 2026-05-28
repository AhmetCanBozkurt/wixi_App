using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiTenantPaymentSetting : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TenantId { get; set; }
    public WixiTenant Tenant { get; set; } = null!;

    /// <summary>
    /// "iyzipay" | "stripe" | "platform_default"
    /// platform_default → WixiPlatformPaymentSetting veya appsettings'ten okur
    /// </summary>
    public string ActiveGateway { get; set; } = "platform_default";

    // Stripe — şifreli
    public string? StripeSecretKey { get; set; }
    public string? StripePublishableKey { get; set; }
    public string? StripeWebhookSecret { get; set; }

    // Iyzipay — şifreli
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
