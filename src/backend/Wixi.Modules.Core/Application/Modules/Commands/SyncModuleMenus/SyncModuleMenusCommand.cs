using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Commands.SyncModuleMenus;

public record SyncItem(Guid Id, Guid? ParentId, int SortOrder);

public record SyncModuleMenusCommand(List<SyncItem> Items) : IRequest;

public class SyncModuleMenusCommandHandler : IRequestHandler<SyncModuleMenusCommand>
{
    private readonly WixiCoreDbContext _context;

    public SyncModuleMenusCommandHandler(WixiCoreDbContext context) => _context = context;

    public async Task Handle(SyncModuleMenusCommand request, CancellationToken cancellationToken)
    {
        var ids = request.Items.Select(i => i.Id).ToList();
        var menus = await _context.ModuleMenus
            .Where(m => ids.Contains(m.Id))
            .ToListAsync(cancellationToken);

        foreach (var item in request.Items)
        {
            var menu = menus.FirstOrDefault(m => m.Id == item.Id);
            if (menu is null) continue;
            menu.ParentId  = item.ParentId;
            menu.SortOrder = item.SortOrder;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
