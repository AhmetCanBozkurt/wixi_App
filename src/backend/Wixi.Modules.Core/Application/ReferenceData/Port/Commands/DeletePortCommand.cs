using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Port.Commands;

public record DeletePortCommand(Guid Id) : IRequest<bool>;

public class DeletePortCommandHandler : IRequestHandler<DeletePortCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeletePortCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeletePortCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Ports
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
