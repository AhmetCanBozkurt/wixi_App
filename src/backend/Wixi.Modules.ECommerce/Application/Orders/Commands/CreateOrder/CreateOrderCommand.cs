using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Cart;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Orders.Commands.CreateOrder;

public record OrderItemInput(Guid ProductId, Guid? VariantId, int Quantity);

public record CreateOrderResult(Guid OrderId, string OrderNumber);

public record CreateOrderCommand(
    Guid CustomerId,
    List<OrderItemInput> Items,
    string ShippingAddress,
    string BillingAddress,
    string Currency = "TRY"
) : IRequest<CreateOrderResult>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResult>
{
    private readonly ECommerceDbContext _db;
    private readonly IMediator _mediator;

    public CreateOrderCommandHandler(ECommerceDbContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
    }

    public async Task<CreateOrderResult> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        var orderItems = new List<WixiOrderItem>();
        decimal totalAmount = 0;

        foreach (var input in request.Items)
        {
            decimal unitPrice;
            string productName;
            string? variantName = null;
            string? sku = null;

            if (input.VariantId.HasValue)
            {
                var variant = await _db.ProductVariants
                    .Include(v => v.Product)
                    .FirstOrDefaultAsync(v => v.Id == input.VariantId && !v.IsDeleted && v.IsActive, ct);

                if (variant == null)
                    throw new InvalidOperationException($"Ürün varyantı bulunamadı: {input.VariantId}");

                unitPrice = variant.Price;
                productName = variant.Product!.Name;
                variantName = variant.Name;
                sku = variant.SKU;

                // Reduce stock
                if (variant.StockQuantity > 0)
                    variant.StockQuantity = Math.Max(0, variant.StockQuantity - input.Quantity);
            }
            else
            {
                var product = await _db.Products
                    .FirstOrDefaultAsync(p => p.Id == input.ProductId && !p.IsDeleted && p.IsActive, ct);

                if (product == null)
                    throw new InvalidOperationException($"Ürün bulunamadı: {input.ProductId}");

                unitPrice = product.BasePrice;
                productName = product.Name;
            }

            var lineTotal = unitPrice * input.Quantity;
            totalAmount += lineTotal;

            orderItems.Add(new WixiOrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = input.ProductId,
                VariantId = input.VariantId,
                ProductName = productName,
                VariantName = variantName,
                SKU = sku,
                Quantity = input.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = lineTotal
            });
        }

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

        var order = new WixiOrder
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            OrderNumber = orderNumber,
            TotalAmount = totalAmount,
            Currency = request.Currency,
            Status = OrderStatus.Pending,
            ShippingAddress = request.ShippingAddress,
            BillingAddress = request.BillingAddress,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        foreach (var item in orderItems)
        {
            item.OrderId = order.Id;
        }

        _db.Orders.Add(order);
        _db.OrderItems.AddRange(orderItems);

        await _db.SaveChangesAsync(ct);

        // Clear the customer's cart
        await _mediator.Send(new ClearCartCommand(request.CustomerId), ct);

        return new CreateOrderResult(order.Id, order.OrderNumber);
    }
}
