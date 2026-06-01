using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Loyalty;

public record LoyaltyHistoryDto(Guid Id, LoyaltyPointType Type, int Points, string? Description, Guid? ReferenceOrderId, DateTime CreatedAt);
public record LoyaltyBalanceDto(int TotalPoints, IReadOnlyList<LoyaltyHistoryDto> Recent);

public record GetLoyaltyBalanceQuery(Guid CustomerId) : IRequest<LoyaltyBalanceDto>;

public class GetLoyaltyBalanceQueryHandler : IRequestHandler<GetLoyaltyBalanceQuery, LoyaltyBalanceDto>
{
    private readonly ECommerceDbContext _db;
    public GetLoyaltyBalanceQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<LoyaltyBalanceDto> Handle(GetLoyaltyBalanceQuery request, CancellationToken ct)
    {
        var entries = await _db.LoyaltyPoints
            .AsNoTracking()
            .Where(lp => lp.CustomerId == request.CustomerId && lp.IsActive && !lp.IsDeleted)
            .OrderByDescending(lp => lp.CreatedAt)
            .ToListAsync(ct);

        var total = entries.Sum(lp => lp.Type switch
        {
            LoyaltyPointType.Earned or LoyaltyPointType.Adjusted => lp.Points,
            LoyaltyPointType.Spent or LoyaltyPointType.Expired => -lp.Points,
            _ => 0
        });

        var recent = entries.Take(20).Select(lp =>
            new LoyaltyHistoryDto(lp.Id, lp.Type, lp.Points, lp.Description, lp.ReferenceOrderId, lp.CreatedAt))
            .ToList();

        return new LoyaltyBalanceDto(total, recent);
    }
}
