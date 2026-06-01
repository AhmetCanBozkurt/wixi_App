using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Analytics;

public record DailyStatDto(string Date, int Orders, decimal Revenue);

public record GetOrdersByDayQuery(DateTime From, DateTime To) : IRequest<IReadOnlyList<DailyStatDto>>;

public class GetOrdersByDayQueryHandler : IRequestHandler<GetOrdersByDayQuery, IReadOnlyList<DailyStatDto>>
{
    private readonly ECommerceDbContext _db;
    public GetOrdersByDayQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<DailyStatDto>> Handle(GetOrdersByDayQuery request, CancellationToken ct)
    {
        var raw = await _db.Orders
            .AsNoTracking()
            .Where(o => !o.IsDeleted && o.Status != OrderStatus.Cancelled
                && o.CreatedAt.Date >= request.From.Date && o.CreatedAt.Date <= request.To.Date)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Orders = g.Count(), Revenue = g.Sum(o => o.TotalAmount) })
            .ToListAsync(ct);

        var lookup = raw.ToDictionary(x => x.Date);

        var days = new List<DailyStatDto>();
        for (var d = request.From.Date; d <= request.To.Date; d = d.AddDays(1))
        {
            if (lookup.TryGetValue(d, out var stat))
                days.Add(new DailyStatDto(d.ToString("yyyy-MM-dd"), stat.Orders, stat.Revenue));
            else
                days.Add(new DailyStatDto(d.ToString("yyyy-MM-dd"), 0, 0));
        }

        return days;
    }
}
