using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Favorites;

public record GetFavoritesQuery(Guid CustomerId) : IRequest<IReadOnlyList<Guid>>;

public class GetFavoritesQueryHandler : IRequestHandler<GetFavoritesQuery, IReadOnlyList<Guid>>
{
    private readonly ECommerceDbContext _db;
    public GetFavoritesQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<Guid>> Handle(GetFavoritesQuery request, CancellationToken ct)
    {
        return await _db.Favorites
            .AsNoTracking()
            .Where(f => f.CustomerId == request.CustomerId)
            .Select(f => f.ProductId)
            .ToListAsync(ct);
    }
}
