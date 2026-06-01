using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Warehouses.Commands.UpdateWarehouse;

public record UpdateWarehouseCommand(
    Guid Id,
    string Name,
    string Code,
    string? Address,
    bool IsDefault,
    bool IsActive
) : IRequest<bool>;

public class UpdateWarehouseCommandHandler : IRequestHandler<UpdateWarehouseCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateWarehouseCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateWarehouseCommand request, CancellationToken ct)
    {
        var warehouse = await _db.Warehouses
            .FirstOrDefaultAsync(w => w.Id == request.Id && !w.IsDeleted, ct);

        if (warehouse is null)
            return false;

        if (request.IsDefault)
        {
            await _db.Warehouses
                .Where(w => !w.IsDeleted && w.IsDefault && w.Id != request.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(w => w.IsDefault, false), ct);
        }

        warehouse.Name = request.Name;
        warehouse.Code = request.Code;
        warehouse.Address = request.Address;
        warehouse.IsDefault = request.IsDefault;
        warehouse.IsActive = request.IsActive;
        warehouse.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
