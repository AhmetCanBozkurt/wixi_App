using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Orders.Commands.UpdateOrderStatus;

public record UpdateOrderStatusCommand(
    Guid Id, 
    OrderStatus Status, 
    string? TrackingNumber = null, 
    string? ShippingProvider = null) : IRequest<bool>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateOrderStatusCommandHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<bool> Handle(UpdateOrderStatusCommand request, CancellationToken ct)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == request.Id, ct);
        if (order == null) return false;

        order.Status = request.Status;
        
        if (!string.IsNullOrWhiteSpace(request.TrackingNumber))
            order.TrackingNumber = request.TrackingNumber;
            
        if (!string.IsNullOrWhiteSpace(request.ShippingProvider))
            order.ShippingProvider = request.ShippingProvider;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
