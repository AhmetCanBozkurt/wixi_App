using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Orders.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Orders.Queries.GetMyOrders;

public record GetMyOrdersQuery(Guid CustomerId) : IRequest<List<OrderDto>>;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, List<OrderDto>>
{
    private readonly ECommerceDbContext _db;

    public GetMyOrdersQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<List<OrderDto>> Handle(GetMyOrdersQuery request, CancellationToken ct)
    {
        return await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .AsNoTracking()
            .Where(o => o.CustomerId == request.CustomerId && !o.IsDeleted)
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
                ShippingAddress = o.ShippingAddress,
                BillingAddress = o.BillingAddress,
                CreatedAt = o.CreatedAt,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    VariantName = i.VariantName,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice
                }).ToList()
            })
            .ToListAsync(ct);
    }
}
