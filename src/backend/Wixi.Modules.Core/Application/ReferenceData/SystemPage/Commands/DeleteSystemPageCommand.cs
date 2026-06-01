using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.SystemPage.Commands;

public record DeleteSystemPageCommand(Guid Id) : IRequest<bool>;

public class DeleteSystemPageCommandHandler : IRequestHandler<DeleteSystemPageCommand, bool>
{
    private readonly WixiCoreDbContext _context;
    public DeleteSystemPageCommandHandler(WixiCoreDbContext context) => _context = context;

    public async Task<bool> Handle(DeleteSystemPageCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SystemPages.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (entity is null) return false;
        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
