using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Navigation.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Navigation.Commands.UpdateMenu;

public record UpdateMenuCommand(MenuEditDto Menu) : IRequest<bool>;

public class UpdateMenuCommandHandler : IRequestHandler<UpdateMenuCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateMenuCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateMenuCommand request, CancellationToken cancellationToken)
    {
        if (request.Menu.Id == null) return false;

        var menu = await _context.Menus
            .Include(m => m.Translations)
            .FirstOrDefaultAsync(m => m.Id == request.Menu.Id, cancellationToken);

        if (menu == null) return false;

        // Update basic fields
        menu.ParentId = request.Menu.ParentId;
        menu.Path = request.Menu.Path;
        menu.Icon = request.Menu.Icon;
        menu.IconColor = request.Menu.IconColor;
        menu.SortOrder = request.Menu.SortOrder;
        menu.IsVisible = request.Menu.IsVisible;
        menu.UpdatedAt = DateTime.UtcNow;

        // Sync Translations (Delta Sync)
        var existingTranslations = menu.Translations.ToList();
        
        // 1. Remove translations that are not in the request
        foreach (var existing in existingTranslations)
        {
            if (!request.Menu.Translations.Any(x => x.LanguageId == existing.LanguageId))
            {
                _context.MenuTranslations.Remove(existing);
            }
        }

        // 2. Update or Add translations
        foreach (var transDto in request.Menu.Translations)
        {
            var existing = existingTranslations.FirstOrDefault(x => x.LanguageId == transDto.LanguageId);
            if (existing != null)
            {
                // Update existing record
                existing.Title = transDto.Title;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Add new record
                var newTrans = new WixiMenuTranslation
                {
                    MenuId = menu.Id,
                    LanguageId = transDto.LanguageId,
                    Title = transDto.Title,
                    CreatedAt = DateTime.UtcNow
                };
                _context.MenuTranslations.Add(newTrans);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
