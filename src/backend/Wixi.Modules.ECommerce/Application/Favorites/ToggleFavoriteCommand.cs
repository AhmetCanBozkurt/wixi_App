using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Favorites;

public record ToggleFavoriteCommand(Guid CustomerId, Guid ProductId) : IRequest<bool>;

public class ToggleFavoriteCommandHandler : IRequestHandler<ToggleFavoriteCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public ToggleFavoriteCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(ToggleFavoriteCommand request, CancellationToken ct)
    {
        var existing = await _db.Favorites
            .FirstOrDefaultAsync(f => f.CustomerId == request.CustomerId && f.ProductId == request.ProductId, ct);

        if (existing is not null)
        {
            _db.Favorites.Remove(existing);
            await _db.SaveChangesAsync(ct);
            return false; // removed
        }

        _db.Favorites.Add(new WixiFavorite
        {
            CustomerId = request.CustomerId,
            ProductId = request.ProductId
        });
        await _db.SaveChangesAsync(ct);
        return true; // added
    }
}
