using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Stock.Commands.CreateStockMovement;

public record CreateStockMovementCommand(
    Guid VariantId,
    Guid WarehouseId,
    StockMovementType Type,
    int Quantity,
    string? Notes,
    Guid? ToWarehouseId
) : IRequest<Guid>;

public class CreateStockMovementCommandHandler : IRequestHandler<CreateStockMovementCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public CreateStockMovementCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateStockMovementCommand request, CancellationToken ct)
    {
        var movement = new WixiStockMovement
        {
            VariantId = request.VariantId,
            WarehouseId = request.WarehouseId,
            Type = request.Type,
            Quantity = request.Quantity,
            Notes = request.Notes,
            ToWarehouseId = request.ToWarehouseId,
            MovementDate = DateTime.UtcNow
        };

        _db.StockMovements.Add(movement);

        var sourceStock = await FindOrCreateStock(request.VariantId, request.WarehouseId, ct);

        if (request.Type == StockMovementType.SALE)
        {
            sourceStock.Quantity -= request.Quantity;
        }
        else if (request.Type == StockMovementType.TRF)
        {
            sourceStock.Quantity -= request.Quantity;

            if (request.ToWarehouseId.HasValue)
            {
                var targetStock = await FindOrCreateStock(request.VariantId, request.ToWarehouseId.Value, ct);
                targetStock.Quantity += request.Quantity;
                targetStock.UpdatedAt = DateTime.UtcNow;
            }
        }
        else
        {
            // GRN, RTN, ADJ — apply signed quantity directly
            sourceStock.Quantity += request.Quantity;
        }

        sourceStock.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return movement.Id;
    }

    private async Task<WixiStock> FindOrCreateStock(Guid variantId, Guid warehouseId, CancellationToken ct)
    {
        var stock = await _db.Stocks
            .FirstOrDefaultAsync(s => s.VariantId == variantId && s.WarehouseId == warehouseId, ct);

        if (stock is not null)
            return stock;

        stock = new WixiStock
        {
            VariantId = variantId,
            WarehouseId = warehouseId,
            Quantity = 0,
            ReservedQuantity = 0
        };

        _db.Stocks.Add(stock);
        return stock;
    }
}
