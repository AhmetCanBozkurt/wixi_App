using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Incoterm.Commands;

public record DeleteIncotermCommand(Guid Id) : IRequest<bool>;

public class DeleteIncotermCommandHandler : IRequestHandler<DeleteIncotermCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteIncotermCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteIncotermCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Incoterms
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
