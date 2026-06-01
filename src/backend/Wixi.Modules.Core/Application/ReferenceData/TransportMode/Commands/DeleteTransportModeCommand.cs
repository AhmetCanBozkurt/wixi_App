using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TransportMode.Commands;

public record DeleteTransportModeCommand(Guid Id) : IRequest<bool>;

public class DeleteTransportModeCommandHandler : IRequestHandler<DeleteTransportModeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteTransportModeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteTransportModeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TransportModes
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
