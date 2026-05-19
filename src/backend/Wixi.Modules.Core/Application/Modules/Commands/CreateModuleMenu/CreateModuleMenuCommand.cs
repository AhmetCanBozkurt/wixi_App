using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Application.Modules.Queries.GetModuleMenus;

namespace Wixi.Modules.Core.Application.Modules.Commands.CreateModuleMenu;

public record CreateModuleMenuCommand(ModuleMenuDto Menu) : IRequest<Guid>;

public class CreateModuleMenuCommandHandler : IRequestHandler<CreateModuleMenuCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateModuleMenuCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateModuleMenuCommand request, CancellationToken cancellationToken)
    {
        var menu = new WixiModuleMenu
        {
            ModuleId = request.Menu.ModuleId,
            ParentId = request.Menu.ParentId,
            Path = request.Menu.Path,
            Icon = request.Menu.Icon,
            IconColor = request.Menu.IconColor,
            SortOrder = request.Menu.SortOrder,
            VisibleToTenant = request.Menu.VisibleToTenant,
            Translations = request.Menu.Translations.Select(t => new WixiModuleMenuTranslation
            {
                LanguageId = t.LanguageId,
                Title = t.Title
            }).ToList()
        };

        _context.ModuleMenus.Add(menu);
        await _context.SaveChangesAsync(cancellationToken);
        return menu.Id;
    }
}
