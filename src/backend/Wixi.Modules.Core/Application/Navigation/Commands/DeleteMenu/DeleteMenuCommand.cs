using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Navigation.Commands.DeleteMenu;

public record DeleteMenuCommand(Guid Id) : IRequest<bool>;

public class DeleteMenuCommandHandler : IRequestHandler<DeleteMenuCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteMenuCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteMenuCommand request, CancellationToken cancellationToken)
    {
        var menu = await _context.Menus.FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);
        if (menu == null) return false;

        // Soft delete
        menu.IsDeleted = true;
        menu.IsActive = false;
        menu.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
