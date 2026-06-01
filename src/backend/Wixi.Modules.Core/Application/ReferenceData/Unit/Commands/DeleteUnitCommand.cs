using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Unit.Commands;

public record DeleteUnitCommand(Guid Id) : IRequest<bool>;

public class DeleteUnitCommandHandler : IRequestHandler<DeleteUnitCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteUnitCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteUnitCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Units.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
