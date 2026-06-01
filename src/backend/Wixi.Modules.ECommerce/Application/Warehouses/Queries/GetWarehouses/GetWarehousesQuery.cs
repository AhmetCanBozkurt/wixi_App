using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Warehouses.Queries.GetWarehouses;

public record WarehouseDto(
    Guid Id,
    string Name,
    string Code,
    string? Address,
    bool IsDefault,
    bool IsActive
);

public record GetWarehousesQuery : IRequest<IReadOnlyList<WarehouseDto>>;

public class GetWarehousesQueryHandler : IRequestHandler<GetWarehousesQuery, IReadOnlyList<WarehouseDto>>
{
    private readonly ECommerceDbContext _db;

    public GetWarehousesQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<WarehouseDto>> Handle(GetWarehousesQuery request, CancellationToken ct)
    {
        return await _db.Warehouses
            .AsNoTracking()
            .Where(w => !w.IsDeleted)
            .OrderByDescending(w => w.IsDefault)
            .ThenBy(w => w.Name)
            .Select(w => new WarehouseDto(
                w.Id,
                w.Name,
                w.Code,
                w.Address,
                w.IsDefault,
                w.IsActive
            ))
            .ToListAsync(ct);
    }
}
