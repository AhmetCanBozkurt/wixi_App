using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Navigation.Dto;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
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

        // 3. Resolve Tenant Context
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.OwnerUserId == userId && t.IsActive && !t.IsDeleted, cancellationToken);

        var roles = _httpContextAccessor.HttpContext?.User.Claims
            .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList() ?? new List<string>();

        var isAdmin = roles.Contains("Admin");
        var isTenantAdmin = roles.Contains("TenantAdmin");

        // 4. Fetch Eligible Menus from DB
        
        // A. Fetch User-Specific Menus (WixiMenu)
        var userMenus = await _context.Menus
            .Include(m => m.Translations)
            .Where(m => m.IsActive && !m.IsDeleted && m.IsVisible && m.UserId == userId)
            .ToListAsync(cancellationToken);

        // B. Fetch Module-Template Menus (WixiModuleMenu)
        var moduleMenus = new List<WixiModuleMenu>();
        if (isAdmin)
        {
            // Admin sees all system templates
            moduleMenus = await _context.ModuleMenus
                .Include(m => m.Translations)
                .Include(m => m.Module)
                .Where(m => m.IsActive && !m.IsDeleted)
                .ToListAsync(cancellationToken);
        }
        else if (isTenantAdmin && tenant != null)
        {
            var enabledModules = tenant.EnabledModules?.Split(',').Select(x => x.Trim().ToLower()).ToList() ?? new List<string>();
            
            moduleMenus = await _context.ModuleMenus
                .Include(m => m.Translations)
                .Include(m => m.Module)
                .Where(m => m.IsActive && !m.IsDeleted && m.VisibleToTenant && 
                    (m.Module != null && enabledModules.Contains(m.Module.Code.ToLower())))
                .ToListAsync(cancellationToken);
        }

        // 5. Resolve target language
        var baseLangCode = currentLangCode.Split('-')[0];
        var lang = await _context.Languages
            .FirstOrDefaultAsync(l => l.Code == currentLangCode, cancellationToken)
            ?? await _context.Languages.FirstOrDefaultAsync(l => l.Code.StartsWith(baseLangCode), cancellationToken)
            ?? await _context.Languages.FirstOrDefaultAsync(l => l.IsDefault, cancellationToken);

        if (lang == null) return new List<MenuDto>();

        // 6. Map and Combine
        var allDtos = new List<MenuDto>();

        // Map User Menus
        allDtos.AddRange(userMenus.Select(m => new MenuDto
        {
            Id = m.Id,
            ParentId = m.ParentId,
            Path = m.Path.Replace("{tenantSlug}", tenant?.Slug ?? "default"),
            Icon = m.Icon,
            IconColor = m.IconColor,
            SortOrder = m.SortOrder,
            Title = m.Translations.FirstOrDefault(t => t.LanguageId == lang.Id)?.Title ?? "Untitled",
            Children = new List<MenuDto>()
        }));

        // Map Module Template Menus
        allDtos.AddRange(moduleMenus.Select(m => new MenuDto
        {
            Id = m.Id,
            ParentId = m.ParentId,
            Path = m.Path.Replace("{tenantSlug}", tenant?.Slug ?? "default"),
            Icon = m.Icon,
            IconColor = m.IconColor,
            SortOrder = m.SortOrder,
            Title = m.Translations.FirstOrDefault(t => t.LanguageId == lang.Id)?.Title ?? "Untitled",
            Children = new List<MenuDto>()
        }));

        // 7. Build hierarchy
        var rootMenus = new List<MenuDto>();
        var menuMap = allDtos.ToDictionary(m => m.Id);

        foreach (var dto in allDtos)
        {
            if (dto.ParentId == null)
            {
                rootMenus.Add(dto);
            }
            else if (menuMap.ContainsKey(dto.ParentId.Value))
            {
                menuMap[dto.ParentId.Value].Children.Add(dto);
            }
        }

        return rootMenus.OrderBy(m => m.SortOrder).ToList();
    }
}
