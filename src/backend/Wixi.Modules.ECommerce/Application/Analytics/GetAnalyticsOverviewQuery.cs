using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Analytics;

public record TopProductDto(Guid ProductId, string ProductName, int TotalSold, decimal TotalRevenue);

public record AnalyticsOverviewDto(
    decimal TotalRevenue,
    int TotalOrders,
    decimal AvgOrderValue,
    int TotalCustomers,
    int PendingOrders,
    IReadOnlyList<TopProductDto> TopProducts
);

public record GetAnalyticsOverviewQuery(DateTime? From, DateTime? To) : IRequest<AnalyticsOverviewDto>;

public class GetAnalyticsOverviewQueryHandler : IRequestHandler<GetAnalyticsOverviewQuery, AnalyticsOverviewDto>
{
    private readonly ECommerceDbContext _db;
    public GetAnalyticsOverviewQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<AnalyticsOverviewDto> Handle(GetAnalyticsOverviewQuery request, CancellationToken ct)
    {
        var from = request.From ?? DateTime.UtcNow.AddDays(-30);
        var to = request.To ?? DateTime.UtcNow;

        var orders = await _db.Orders
            .AsNoTracking()
            .Where(o => !o.IsDeleted && o.CreatedAt >= from && o.CreatedAt <= to)
            .ToListAsync(ct);

        var completedOrders = orders.Where(o => o.Status != OrderStatus.Cancelled).ToList();

        var totalRevenue = completedOrders.Sum(o => o.TotalAmount);
        var totalOrders = completedOrders.Count;
        var avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        var pendingOrders = orders.Count(o => o.Status == OrderStatus.Pending);

        var totalCustomers = await _db.Customers.AsNoTracking().CountAsync(ct);

        var topProducts = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => !oi.Order.IsDeleted && oi.Order.CreatedAt >= from && oi.Order.CreatedAt <= to
                && oi.Order.Status != OrderStatus.Cancelled)
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g => new TopProductDto(
                g.Key.ProductId,
                g.Key.ProductName,
                g.Sum(x => x.Quantity),
                g.Sum(x => x.TotalPrice)))
            .OrderByDescending(x => x.TotalRevenue)
            .Take(5)
            .ToListAsync(ct);

        return new AnalyticsOverviewDto(totalRevenue, totalOrders, avgOrder, totalCustomers, pendingOrders, topProducts);
    }
}
