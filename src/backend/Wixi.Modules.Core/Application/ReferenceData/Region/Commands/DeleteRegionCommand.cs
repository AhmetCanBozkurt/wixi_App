using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Region.Commands;

public record DeleteRegionCommand(Guid Id) : IRequest<bool>;

public class DeleteRegionCommandHandler : IRequestHandler<DeleteRegionCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteRegionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteRegionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Regions
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
