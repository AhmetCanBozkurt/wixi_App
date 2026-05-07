using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Subscriptions.Commands.HandleStripeWebhook;

public class HandleStripeWebhookCommandHandler : IRequestHandler<HandleStripeWebhookCommand>
{
    private readonly WixiCoreDbContext _db;
    private readonly string _webhookSecret;
    private readonly ILogger<HandleStripeWebhookCommandHandler> _logger;

    public HandleStripeWebhookCommandHandler(
        WixiCoreDbContext db,
        IOptions<StripeOptions> stripeOptions,
        ILogger<HandleStripeWebhookCommandHandler> logger)
    {
        _db = db;
        _webhookSecret = stripeOptions.Value.WebhookSecret;
        _logger = logger;
        StripeConfiguration.ApiKey = stripeOptions.Value.SecretKey;
    }

    public async Task Handle(HandleStripeWebhookCommand request, CancellationToken ct)
    {
        var stripeEvent = EventUtility.ConstructEvent(
            request.Payload,
            request.StripeSignature,
            _webhookSecret);

        switch (stripeEvent.Type)
        {
            case EventTypes.CheckoutSessionCompleted:
                await HandleCheckoutCompletedAsync(stripeEvent, ct);
                break;
            case EventTypes.InvoicePaymentSucceeded:
                await HandleInvoiceSucceededAsync(stripeEvent, ct);
                break;
            case EventTypes.InvoicePaymentFailed:
                await HandleInvoiceFailedAsync(stripeEvent, ct);
                break;
            case EventTypes.CustomerSubscriptionDeleted:
                await HandleSubscriptionDeletedAsync(stripeEvent, ct);
                break;
            default:
                _logger.LogDebug("Unhandled Stripe event type: {Type}", stripeEvent.Type);
                break;
        }
    }

    private async Task HandleCheckoutCompletedAsync(Event stripeEvent, CancellationToken ct)
    {
        var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
        if (session is null) return;

        if (!session.Metadata.TryGetValue("tenantId", out var tenantIdStr)
            || !Guid.TryParse(tenantIdStr, out var tenantId))
            return;

        session.Metadata.TryGetValue("planCode", out var planCode);
        session.Metadata.TryGetValue("billingInterval", out var billingInterval);

        var plan = await _db.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == (planCode ?? "starter") && p.IsActive && !p.IsDeleted, ct);
        if (plan is null) return;

        var existing = await _db.TenantSubscriptions
            .Where(s => s.TenantId == tenantId && s.Status != "Cancelled")
            .ToListAsync(ct);

        foreach (var s in existing)
        {
            s.Status = "Cancelled";
            s.UpdatedAt = DateTime.UtcNow;
        }

        var stripeSub = session.Subscription as Stripe.Subscription
            ?? (session.SubscriptionId is not null
                ? await new SubscriptionService().GetAsync(session.SubscriptionId, cancellationToken: ct)
                : null);

        var now = DateTime.UtcNow;
        _db.TenantSubscriptions.Add(new WixiTenantSubscription
        {
            TenantId = tenantId,
            PlanId = plan.Id,
            Status = "Active",
            BillingInterval = billingInterval ?? "Monthly",
            StripeCustomerId = session.CustomerId,
            StripeSubscriptionId = session.SubscriptionId,
            CurrentPeriodStart = stripeSub?.CurrentPeriodStart ?? now,
            CurrentPeriodEnd = stripeSub?.CurrentPeriodEnd ?? now.AddMonths(1)
        });

        _db.PaymentTransactions.Add(new WixiPaymentTransaction
        {
            TenantId = tenantId,
            Amount = (session.AmountTotal ?? 0) / 100m,
            Currency = session.Currency?.ToUpper() ?? "USD",
            Status = "Succeeded",
            ExternalId = session.PaymentIntentId,
            ExternalSubscriptionId = session.SubscriptionId
        });

        await _db.SaveChangesAsync(ct);
    }

    private async Task HandleInvoiceSucceededAsync(Event stripeEvent, CancellationToken ct)
    {
        var invoice = stripeEvent.Data.Object as Invoice;
        if (invoice?.SubscriptionId is null) return;

        var sub = await _db.TenantSubscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == invoice.SubscriptionId, ct);
        if (sub is null) return;

        var stripeSub = await new SubscriptionService().GetAsync(invoice.SubscriptionId, cancellationToken: ct);
        sub.Status = "Active";
        sub.CurrentPeriodStart = stripeSub.CurrentPeriodStart;
        sub.CurrentPeriodEnd = stripeSub.CurrentPeriodEnd;
        sub.UpdatedAt = DateTime.UtcNow;

        _db.PaymentTransactions.Add(new WixiPaymentTransaction
        {
            TenantId = sub.TenantId,
            Amount = invoice.AmountPaid / 100m,
            Currency = invoice.Currency.ToUpper(),
            Status = "Succeeded",
            ExternalId = invoice.PaymentIntentId,
            ExternalSubscriptionId = invoice.SubscriptionId
        });

        await _db.SaveChangesAsync(ct);
    }

    private async Task HandleInvoiceFailedAsync(Event stripeEvent, CancellationToken ct)
    {
        var invoice = stripeEvent.Data.Object as Invoice;
        if (invoice?.SubscriptionId is null) return;

        var sub = await _db.TenantSubscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == invoice.SubscriptionId, ct);
        if (sub is null) return;

        sub.Status = "PastDue";
        sub.UpdatedAt = DateTime.UtcNow;

        _db.PaymentTransactions.Add(new WixiPaymentTransaction
        {
            TenantId = sub.TenantId,
            Amount = invoice.AmountDue / 100m,
            Currency = invoice.Currency.ToUpper(),
            Status = "Failed",
            ExternalId = invoice.PaymentIntentId,
            ExternalSubscriptionId = invoice.SubscriptionId,
            FailureReason = invoice.LastFinalizationError?.Message
        });

        await _db.SaveChangesAsync(ct);
    }

    private async Task HandleSubscriptionDeletedAsync(Event stripeEvent, CancellationToken ct)
    {
        var stripeSub = stripeEvent.Data.Object as Stripe.Subscription;
        if (stripeSub is null) return;

        var sub = await _db.TenantSubscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSub.Id, ct);
        if (sub is null) return;

        sub.Status = "Cancelled";
        sub.UpdatedAt = DateTime.UtcNow;

        var freePlan = await _db.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == "free" && p.IsActive && !p.IsDeleted, ct);

        if (freePlan != null)
        {
            _db.TenantSubscriptions.Add(new WixiTenantSubscription
            {
                TenantId = sub.TenantId,
                PlanId = freePlan.Id,
                Status = "Active",
                CurrentPeriodStart = DateTime.UtcNow,
                CurrentPeriodEnd = DateTime.UtcNow.AddYears(100)
            });
        }

        await _db.SaveChangesAsync(ct);
    }
}
