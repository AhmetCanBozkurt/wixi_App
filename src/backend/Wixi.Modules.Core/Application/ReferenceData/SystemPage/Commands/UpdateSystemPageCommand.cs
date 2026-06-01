using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.SystemPage.Commands;

public record UpdateSystemPageCommand(Guid Id, string Path, string Name, string? Group, string? Icon, int SortOrder, bool IsActive) : IRequest<bool>;

public class UpdateSystemPageCommandHandler : IRequestHandler<UpdateSystemPageCommand, bool>
{
    private readonly WixiCoreDbContext _context;
    public UpdateSystemPageCommandHandler(WixiCoreDbContext context) => _context = context;

    public async Task<bool> Handle(UpdateSystemPageCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SystemPages.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (entity is null) return false;
        entity.Path = request.Path;
        entity.Name = request.Name;
        entity.Group = request.Group;
        entity.Icon = request.Icon;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
