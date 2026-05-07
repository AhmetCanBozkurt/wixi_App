namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IStripeService
{
    Task<string> CreateCheckoutSessionAsync(Guid tenantId, string planCode, string billingInterval,
        string successUrl, string cancelUrl, CancellationToken ct = default);

    Task<string> CreateCustomerPortalSessionAsync(string stripeCustomerId, string returnUrl,
        CancellationToken ct = default);
}
