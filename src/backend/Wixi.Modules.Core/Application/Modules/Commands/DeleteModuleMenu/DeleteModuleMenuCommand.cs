using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Commands.DeleteModuleMenu;

public record DeleteModuleMenuCommand(Guid Id) : IRequest<bool>;

public class DeleteModuleMenuCommandHandler : IRequestHandler<DeleteModuleMenuCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteModuleMenuCommandHandler(WixiCoreDbContext context) => _context = context;

    public async Task<bool> Handle(DeleteModuleMenuCommand request, CancellationToken cancellationToken)
    {
        var menu = await _context.ModuleMenus
            .FirstOrDefaultAsync(m => m.Id == request.Id && !m.IsDeleted, cancellationToken);

        if (menu is null) return false;

        menu.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
