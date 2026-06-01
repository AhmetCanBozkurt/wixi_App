using Microsoft.EntityFrameworkCore;
using Stripe;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly WixiCoreDbContext _db;
    private readonly IPaymentSettingsProvider _settingsProvider;
    private StripeOptions? _cachedOptions;

    public StripeService(WixiCoreDbContext db, IPaymentSettingsProvider settingsProvider)
    {
        _db = db;
        _settingsProvider = settingsProvider;
    }

    private async Task<StripeOptions> GetOptionsAsync(CancellationToken ct)
    {
        if (_cachedOptions is not null) return _cachedOptions;
        _cachedOptions = await _settingsProvider.GetStripeOptionsAsync(ct);
        StripeConfiguration.ApiKey = _cachedOptions.SecretKey;
        return _cachedOptions;
    }

    public async Task<string> CreateCheckoutSessionAsync(
        Guid tenantId, string planCode, string billingInterval,
        string successUrl, string cancelUrl, CancellationToken ct = default)
    {
        await GetOptionsAsync(ct);

        var plan = await _db.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == planCode && p.IsActive && !p.IsDeleted, ct)
            ?? throw new InvalidOperationException($"Plan '{planCode}' bulunamadı.");

        var priceId = billingInterval.Equals("Yearly", StringComparison.OrdinalIgnoreCase)
            ? plan.StripePriceIdYearly
            : plan.StripePriceIdMonthly;

        if (string.IsNullOrEmpty(priceId))
            throw new InvalidOperationException($"'{planCode}' planı için Stripe fiyat ID'si tanımlı değil.");

        var tenant = await _db.Tenants.FindAsync([tenantId], ct)
            ?? throw new InvalidOperationException($"Tenant bulunamadı.");

        var service = new Stripe.Checkout.SessionService();
        var sessionOptions = new Stripe.Checkout.SessionCreateOptions
        {
            Mode = "subscription",
            LineItems = [new() { Price = priceId, Quantity = 1 }],
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            CustomerEmail = tenant.OwnerEmail,
            Metadata = new Dictionary<string, string>
            {
                ["tenantId"] = tenantId.ToString(),
                ["planCode"] = planCode,
                ["billingInterval"] = billingInterval
            }
        };

        var session = await service.CreateAsync(sessionOptions, cancellationToken: ct);
        return session.Url;
    }

    public async Task<string> CreateCustomerPortalSessionAsync(
        string stripeCustomerId, string returnUrl, CancellationToken ct = default)
    {
        await GetOptionsAsync(ct);
        var service = new Stripe.BillingPortal.SessionService();
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = stripeCustomerId,
            ReturnUrl = returnUrl
        };
        var session = await service.CreateAsync(options, cancellationToken: ct);
        return session.Url;
    }
}
