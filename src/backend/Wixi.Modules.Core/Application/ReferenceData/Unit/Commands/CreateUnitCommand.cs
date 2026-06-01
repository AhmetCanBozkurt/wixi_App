using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Unit.Commands;

public record CreateUnitCommand(
    string Code,
    string Name,
    string? NameEn,
    string? Symbol,
    Guid? UnitCategoryId,
    bool IsBaseUnit,
    int SortOrder,
    bool IsActive) : IRequest<Guid>;

public class CreateUnitCommandHandler : IRequestHandler<CreateUnitCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateUnitCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateUnitCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiUnit
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Symbol = request.Symbol,
            UnitCategoryId = request.UnitCategoryId,
            IsBaseUnit = request.IsBaseUnit,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.Units.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
