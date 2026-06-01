using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Stock.Queries.GetStockMovements;

public record StockMovementDto(
    Guid Id,
    string VariantName,
    string VariantSKU,
    string ProductName,
    string WarehouseName,
    string MovementTypeName,
    int Quantity,
    string? Notes,
    DateTime MovementDate,
    string? ToWarehouseName,
    string? CreatedByUser
);

public record PagedStockMovementsResult(
    IReadOnlyList<StockMovementDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

public record GetStockMovementsQuery(
    Guid? VariantId = null,
    Guid? WarehouseId = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedStockMovementsResult>;

public class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, PagedStockMovementsResult>
{
    private readonly ECommerceDbContext _db;

    public GetStockMovementsQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<PagedStockMovementsResult> Handle(GetStockMovementsQuery request, CancellationToken ct)
    {
        var query = _db.StockMovements
            .AsNoTracking()
            .Include(m => m.Variant)
                .ThenInclude(v => v!.Product)
            .Include(m => m.Warehouse)
            .Include(m => m.ToWarehouse)
            .Where(m => !m.IsDeleted);

        if (request.VariantId.HasValue)
            query = query.Where(m => m.VariantId == request.VariantId.Value);

        if (request.WarehouseId.HasValue)
            query = query.Where(m => m.WarehouseId == request.WarehouseId.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(m => m.MovementDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new StockMovementDto(
                m.Id,
                m.Variant!.Name,
                m.Variant.SKU,
                m.Variant.Product!.Name,
                m.Warehouse!.Name,
                m.Type.ToString(),
                m.Quantity,
                m.Notes,
                m.MovementDate,
                m.ToWarehouse != null ? m.ToWarehouse.Name : null,
                m.CreatedByUser
            ))
            .ToListAsync(ct);

        return new PagedStockMovementsResult(items, totalCount, request.Page, request.PageSize);
    }
}
