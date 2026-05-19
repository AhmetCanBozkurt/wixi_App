using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Warehouses.Commands.CreateWarehouse;

public record CreateWarehouseCommand(
    string Name,
    string Code,
    string? Address,
    bool IsDefault
) : IRequest<Guid>;

public class CreateWarehouseCommandHandler : IRequestHandler<CreateWarehouseCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public CreateWarehouseCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateWarehouseCommand request, CancellationToken ct)
    {
        if (request.IsDefault)
        {
            await _db.Warehouses
                .Where(w => !w.IsDeleted && w.IsDefault)
                .ExecuteUpdateAsync(s => s.SetProperty(w => w.IsDefault, false), ct);
        }

        var warehouse = new WixiWarehouse
        {
            Name = request.Name,
            Code = request.Code,
            Address = request.Address,
            IsDefault = request.IsDefault
        };

        _db.Warehouses.Add(warehouse);
        await _db.SaveChangesAsync(ct);
        return warehouse.Id;
    }
}
