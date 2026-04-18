using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Navigation.Dto;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Application.Common.Interfaces;
using System.Globalization;

namespace Wixi.Modules.Core.Application.Navigation.Queries.GetSidebarMenus;

public record GetSidebarMenusQuery : IRequest<List<MenuDto>>;

public class GetSidebarMenusQueryHandler : IRequestHandler<GetSidebarMenusQuery, List<MenuDto>>
{
    private readonly WixiCoreDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;

    public GetSidebarMenusQueryHandler(
        WixiCoreDbContext context, 
        ICurrentUserService currentUserService,
        Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _currentUserService = currentUserService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<MenuDto>> Handle(GetSidebarMenusQuery request, CancellationToken cancellationToken)
    {
        // 1. Resolve Language Code
        // Get from Header (Accept-Language) or CurrentUICulture
        var langHeader = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString();
        var currentLangCode = !string.IsNullOrEmpty(langHeader) ? langHeader.Split(',')[0] : CultureInfo.CurrentUICulture.Name;
        
        // 2. Resolve User
        if (string.IsNullOrEmpty(_currentUserService.UserId) || !Guid.TryParse(_currentUserService.UserId, out var userId))
        {
            return new List<MenuDto>();
        }

        // Fetch only active menus for the current user with translations
        var menus = await _context.Menus
            .Include(m => m.Translations)
            .Where(m => m.IsActive && !m.IsDeleted && m.IsVisible && m.UserId == userId)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        // 3. Find target language in DB
        var baseLangCode = currentLangCode.Split('-')[0];
        var lang = await _context.Languages
            .FirstOrDefaultAsync(l => l.Code == currentLangCode, cancellationToken)
            ?? await _context.Languages.FirstOrDefaultAsync(l => l.Code.StartsWith(baseLangCode), cancellationToken)
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
