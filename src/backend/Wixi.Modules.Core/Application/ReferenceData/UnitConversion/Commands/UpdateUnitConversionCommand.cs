using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Commands;

public record UpdateUnitConversionCommand(
    Guid Id,
    Guid FromUnitId,
    Guid ToUnitId,
    decimal Factor,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateUnitConversionCommandHandler : IRequestHandler<UpdateUnitConversionCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateUnitConversionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUnitConversionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UnitConversions.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.FromUnitId = request.FromUnitId;
        entity.ToUnitId = request.ToUnitId;
        entity.Factor = request.Factor;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
