using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Navigation.Dto;
using Wixi.Modules.Core.Infrastructure.Data;
using System.Globalization;

namespace Wixi.Modules.Core.Application.Navigation.Queries.GetSidebarMenus;

public record GetSidebarMenusQuery : IRequest<List<MenuDto>>;

public class GetSidebarMenusQueryHandler : IRequestHandler<GetSidebarMenusQuery, List<MenuDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetSidebarMenusQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuDto>> Handle(GetSidebarMenusQuery request, CancellationToken cancellationToken)
    {
        var currentLangCode = CultureInfo.CurrentUICulture.Name; // e.g. "tr-TR"
        
        // Fetch all active menus with translations for current language
        var menus = await _context.Menus
            .Include(m => m.Translations)
            .Where(m => m.IsActive && !m.IsDeleted && m.IsVisible)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        var lang = await _context.Languages
            .FirstOrDefaultAsync(l => l.Code == currentLangCode, cancellationToken)
            ?? await _context.Languages.FirstOrDefaultAsync(l => l.IsDefault, cancellationToken);

        if (lang == null) return new List<MenuDto>();

        // Build hierarchy
        var allDtos = menus.Select(m => new MenuDto
        {
            Id = m.Id,
            Path = m.Path,
            Icon = m.Icon,
            IconColor = m.IconColor,
            SortOrder = m.SortOrder,
            Title = m.Translations.FirstOrDefault(t => t.LanguageId == lang.Id)?.Title ?? "Untitled",
            Children = new List<MenuDto>() // Will be populated next
        }).ToList();

        // Separate root menus and children (simple parent-child mapping for now)
        // Note: Real hierarchy is usually built with a recursive function or better LINQ
        var rootMenus = new List<MenuDto>();
        var menuMap = allDtos.ToDictionary(m => m.Id);

        foreach (var m in menus)
        {
            var dto = menuMap[m.Id];
            if (m.ParentId == null)
            {
                rootMenus.Add(dto);
            }
            else if (menuMap.ContainsKey(m.ParentId.Value))
            {
                menuMap[m.ParentId.Value].Children.Add(dto);
            }
        }

        return rootMenus.OrderBy(m => m.SortOrder).ToList();
    }
}
