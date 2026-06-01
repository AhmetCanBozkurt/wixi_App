using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Unit.Commands;

public record UpdateUnitCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? Symbol,
    Guid? UnitCategoryId,
    bool IsBaseUnit,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateUnitCommandHandler : IRequestHandler<UpdateUnitCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateUnitCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUnitCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Units.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Symbol = request.Symbol;
        entity.UnitCategoryId = request.UnitCategoryId;
        entity.IsBaseUnit = request.IsBaseUnit;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
