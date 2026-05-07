using MediatR;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;
using Microsoft.Extensions.Options;

namespace Wixi.Modules.Core.Application.Subscriptions.Commands.CancelSubscription;

public class CancelSubscriptionCommandHandler : IRequestHandler<CancelSubscriptionCommand>
{
    private readonly WixiCoreDbContext _db;

    public CancelSubscriptionCommandHandler(WixiCoreDbContext db, IOptions<StripeOptions> stripeOptions)
    {
        _db = db;
        StripeConfiguration.ApiKey = stripeOptions.Value.SecretKey;
    }

    public async Task Handle(CancelSubscriptionCommand request, CancellationToken ct)
    {
        var sub = await _db.TenantSubscriptions
            .Include(s => s.Plan)
            .Where(s => s.Tenant.Slug == request.TenantSlug && s.Status == "Active")
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct)
            ?? throw new InvalidOperationException("Aktif abonelik bulunamadı.");

        if (!string.IsNullOrEmpty(sub.StripeSubscriptionId))
        {
            var service = new SubscriptionService();
            await service.CancelAsync(sub.StripeSubscriptionId, cancellationToken: ct);
        }

        sub.Status = "Cancelled";
        sub.UpdatedAt = DateTime.UtcNow;

        // Revert to free plan
        var freePlan = await _db.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == "free" && p.IsActive && !p.IsDeleted, ct);

        if (freePlan != null)
        {
            _db.TenantSubscriptions.Add(new Domain.Entities.WixiTenantSubscription
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
