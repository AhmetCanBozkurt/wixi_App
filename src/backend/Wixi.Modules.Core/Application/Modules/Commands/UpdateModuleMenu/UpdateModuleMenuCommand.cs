using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Commands.UpdateModuleMenu;

public record UpdateModuleMenuCommand(
    Guid Id,
    Guid? ParentId,
    string Path,
    string? Icon,
    string? IconColor,
    int SortOrder,
    bool VisibleToTenant,
    List<TranslationItem> Translations
) : IRequest<bool>;

public record TranslationItem(Guid LanguageId, string Title);

public class UpdateModuleMenuCommandHandler : IRequestHandler<UpdateModuleMenuCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateModuleMenuCommandHandler(WixiCoreDbContext context) => _context = context;

    public async Task<bool> Handle(UpdateModuleMenuCommand request, CancellationToken cancellationToken)
    {
        var menu = await _context.ModuleMenus
            .Include(m => m.Translations)
            .FirstOrDefaultAsync(m => m.Id == request.Id && !m.IsDeleted, cancellationToken);

        if (menu is null) return false;

        menu.ParentId      = request.ParentId;
        menu.Path          = request.Path;
        menu.Icon          = request.Icon;
        menu.IconColor     = request.IconColor;
        menu.SortOrder     = request.SortOrder;
        menu.VisibleToTenant = request.VisibleToTenant;

        foreach (var t in request.Translations)
        {
            var existing = menu.Translations.FirstOrDefault(x => x.LanguageId == t.LanguageId);
            if (existing is not null)
                existing.Title = t.Title;
            else
                menu.Translations.Add(new() { LanguageId = t.LanguageId, Title = t.Title });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
