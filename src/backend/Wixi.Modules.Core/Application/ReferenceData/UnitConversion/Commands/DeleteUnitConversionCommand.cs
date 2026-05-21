using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Commands;

public record DeleteUnitConversionCommand(Guid Id) : IRequest<bool>;

public class DeleteUnitConversionCommandHandler : IRequestHandler<DeleteUnitConversionCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteUnitConversionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteUnitConversionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UnitConversions.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
