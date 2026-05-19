using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Stock.Queries.GetStockByWarehouse;

public record StockLevelDto(
    Guid StockId,
    Guid VariantId,
    string VariantName,
    string VariantSKU,
    Guid ProductId,
    string ProductName,
    Guid WarehouseId,
    string WarehouseName,
    string WarehouseCode,
    int Quantity,
    int ReservedQuantity,
    int AvailableQuantity,
    int LowStockThreshold,
    bool IsLowStock
);

public record GetStockByWarehouseQuery(Guid? WarehouseId = null) : IRequest<IReadOnlyList<StockLevelDto>>;

public class GetStockByWarehouseQueryHandler : IRequestHandler<GetStockByWarehouseQuery, IReadOnlyList<StockLevelDto>>
{
    private readonly ECommerceDbContext _db;

    public GetStockByWarehouseQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<StockLevelDto>> Handle(GetStockByWarehouseQuery request, CancellationToken ct)
    {
        var query = _db.Stocks
            .AsNoTracking()
            .Include(s => s.Variant)
                .ThenInclude(v => v!.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.Variant != null && !s.Variant.IsDeleted);

        if (request.WarehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == request.WarehouseId.Value);

        return await query
            .Select(s => new StockLevelDto(
                s.Id,
                s.VariantId,
                s.Variant!.Name,
                s.Variant.SKU,
                s.Variant.ProductId,
                s.Variant.Product!.Name,
                s.WarehouseId,
                s.Warehouse!.Name,
                s.Warehouse.Code,
                s.Quantity,
                s.ReservedQuantity,
                s.Quantity - s.ReservedQuantity,
                s.Variant.LowStockThreshold,
                s.Quantity <= s.Variant.LowStockThreshold
            ))
            .ToListAsync(ct);
    }
}
