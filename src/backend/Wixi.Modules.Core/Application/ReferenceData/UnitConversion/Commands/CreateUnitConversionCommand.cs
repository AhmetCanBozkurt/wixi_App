using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Commands;

public record CreateUnitConversionCommand(
    Guid FromUnitId,
    Guid ToUnitId,
    decimal Factor,
    int SortOrder,
    bool IsActive) : IRequest<Guid>;

public class CreateUnitConversionCommandHandler : IRequestHandler<CreateUnitConversionCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateUnitConversionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateUnitConversionCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiUnitConversion
        {
            FromUnitId = request.FromUnitId,
            ToUnitId = request.ToUnitId,
            Factor = request.Factor,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.UnitConversions.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
