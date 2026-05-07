using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Subscriptions.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Subscriptions.Queries.GetTenantSubscription;

public class GetTenantSubscriptionQueryHandler : IRequestHandler<GetTenantSubscriptionQuery, TenantSubscriptionDto?>
{
    private readonly WixiCoreDbContext _db;

    public GetTenantSubscriptionQueryHandler(WixiCoreDbContext db) => _db = db;

    public async Task<TenantSubscriptionDto?> Handle(GetTenantSubscriptionQuery request, CancellationToken ct)
        => await _db.TenantSubscriptions
            .Include(s => s.Tenant)
            .Include(s => s.Plan)
            .Where(s => s.Tenant.Slug == request.TenantSlug)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new TenantSubscriptionDto(
                s.Id, s.TenantId,
                s.Plan.Name, s.Plan.Code,
                s.Plan.PriceMonthly, s.Plan.PriceYearly,
                s.Status,
                s.CurrentPeriodStart, s.CurrentPeriodEnd,
                s.BillingInterval,
                s.StripeCustomerId, s.StripeSubscriptionId))
            .FirstOrDefaultAsync(ct);
}
