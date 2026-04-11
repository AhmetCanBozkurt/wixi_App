using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Navigation.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Navigation.Queries.GetAllMenus;

public record GetAllMenusQuery : IRequest<List<MenuEditDto>>;

public class GetAllMenusQueryHandler : IRequestHandler<GetAllMenusQuery, List<MenuEditDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetAllMenusQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuEditDto>> Handle(GetAllMenusQuery request, CancellationToken cancellationToken)
    {
        var menus = await _context.Menus
            .Include(m => m.Translations)
            .Where(m => !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        return menus.Select(m => new MenuEditDto
        {
            Id = m.Id,
            ParentId = m.ParentId,
            Path = m.Path,
            Icon = m.Icon,
            IconColor = m.IconColor,
            SortOrder = m.SortOrder,
            IsVisible = m.IsVisible,
            Translations = m.Translations.Select(t => new MenuTranslationDto
            {
                LanguageId = t.LanguageId,
                Title = t.Title
            }).ToList()
        }).ToList();
    }
}
