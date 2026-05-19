using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Orders.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Orders.Queries.GetOrders;

public record GetOrdersQuery(string? Search = null) : IRequest<List<OrderDto>>;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, List<OrderDto>>
{
    private readonly ECommerceDbContext _db;

    public GetOrdersQueryHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<List<OrderDto>> Handle(GetOrdersQuery request, CancellationToken ct)
    {
        var query = _db.Orders
            .Include(o => o.Customer)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(o => 
                o.OrderNumber.Contains(request.Search) || 
                o.Customer.FirstName.Contains(request.Search) || 
                o.Customer.LastName.Contains(request.Search));
        }

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerId = o.CustomerId,
                CustomerName = $"{o.Customer.FirstName} {o.Customer.LastName}",
                CustomerEmail = o.Customer.Email,
                TotalAmount = o.TotalAmount,
                Currency = o.Currency,
                Status = o.Status,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(ct);
    }
}
