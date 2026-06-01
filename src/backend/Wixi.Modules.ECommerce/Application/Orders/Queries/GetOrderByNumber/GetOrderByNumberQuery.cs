using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Orders.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Orders.Queries.GetOrderByNumber;

public record GetOrderByNumberQuery(string OrderNumber, Guid CustomerId) : IRequest<OrderDto?>;

public class GetOrderByNumberQueryHandler : IRequestHandler<GetOrderByNumberQuery, OrderDto?>
{
    private readonly ECommerceDbContext _db;

    public GetOrderByNumberQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<OrderDto?> Handle(GetOrderByNumberQuery request, CancellationToken ct)
    {
        var order = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(
                o => o.OrderNumber == request.OrderNumber
                  && o.CustomerId == request.CustomerId
                  && !o.IsDeleted,
                ct);

        if (order == null) return null;

        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            CustomerName = $"{order.Customer.FirstName} {order.Customer.LastName}",
            CustomerEmail = order.Customer.Email,
            TotalAmount = order.TotalAmount,
            Currency = order.Currency,
            Status = order.Status,
            ShippingAddress = order.ShippingAddress,
            BillingAddress = order.BillingAddress,
            TrackingNumber = order.TrackingNumber,
            ShippingProvider = order.ShippingProvider,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                VariantName = i.VariantName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }
}
