using MediatR;
using Wixi.Modules.Core.Application.Navigation.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Navigation.Commands.CreateMenu;

public record CreateMenuCommand(MenuEditDto Menu) : IRequest<Guid>;

public class CreateMenuCommandHandler : IRequestHandler<CreateMenuCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateMenuCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateMenuCommand request, CancellationToken cancellationToken)
    {
        var menu = new WixiMenu
        {
            UserId = request.Menu.UserId,
            ParentId = request.Menu.ParentId,
            Path = request.Menu.Path,
            Icon = request.Menu.Icon,
            IconColor = request.Menu.IconColor,
            SortOrder = request.Menu.SortOrder,
            IsVisible = request.Menu.IsVisible
        };

        foreach (var trans in request.Menu.Translations)
        {
            menu.Translations.Add(new WixiMenuTranslation
            {
                LanguageId = trans.LanguageId,
                Title = trans.Title
            });
        }

        _context.Menus.Add(menu);
        await _context.SaveChangesAsync(cancellationToken);
        return menu.Id;
    }
}
