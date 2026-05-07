using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly WixiCoreDbContext _db;

    public StripeService(WixiCoreDbContext db, IOptions<StripeOptions> options)
    {
        _db = db;
        StripeConfiguration.ApiKey = options.Value.SecretKey;
    }

    public async Task<string> CreateCheckoutSessionAsync(
        Guid tenantId, string planCode, string billingInterval,
        string successUrl, string cancelUrl, CancellationToken ct = default)
    {
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
