using MediatR;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Loyalty;

public record AddLoyaltyPointsCommand(
    Guid CustomerId,
    LoyaltyPointType Type,
    int Points,
    string? Description,
    Guid? ReferenceOrderId
) : IRequest<Guid>;

public class AddLoyaltyPointsCommandHandler : IRequestHandler<AddLoyaltyPointsCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public AddLoyaltyPointsCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(AddLoyaltyPointsCommand request, CancellationToken ct)
    {
        var entry = new WixiLoyaltyPoint
        {
            CustomerId = request.CustomerId,
            Type = request.Type,
            Points = Math.Abs(request.Points),
            Description = request.Description,
            ReferenceOrderId = request.ReferenceOrderId
        };
        _db.LoyaltyPoints.Add(entry);
        await _db.SaveChangesAsync(ct);
        return entry.Id;
    }
}
