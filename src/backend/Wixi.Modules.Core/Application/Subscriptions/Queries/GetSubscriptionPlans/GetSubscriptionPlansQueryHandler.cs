using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Subscriptions.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Subscriptions.Queries.GetSubscriptionPlans;

public class GetSubscriptionPlansQueryHandler : IRequestHandler<GetSubscriptionPlansQuery, List<SubscriptionPlanDto>>
{
    private readonly WixiCoreDbContext _db;

    public GetSubscriptionPlansQueryHandler(WixiCoreDbContext db) => _db = db;

    public async Task<List<SubscriptionPlanDto>> Handle(GetSubscriptionPlansQuery request, CancellationToken ct)
        => await _db.SubscriptionPlans
            .Where(p => p.IsActive && !p.IsDeleted)
            .OrderBy(p => p.SortOrder)
            .Select(p => new SubscriptionPlanDto(
                p.Id, p.Name, p.Code,
                p.PriceMonthly, p.PriceYearly,
                p.FeaturesJson, p.MaxProducts, p.MaxUsers, p.SortOrder))
            .ToListAsync(ct);
}
