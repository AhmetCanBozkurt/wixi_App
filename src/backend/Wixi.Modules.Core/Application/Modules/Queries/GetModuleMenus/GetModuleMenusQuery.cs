using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Queries.GetModuleMenus;

public record GetModuleMenusQuery(Guid ModuleId) : IRequest<List<ModuleMenuDto>>;

public class ModuleMenuDto
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public Guid? ParentId { get; set; }
    public string Path { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public int SortOrder { get; set; }
    public bool VisibleToTenant { get; set; }
    public List<ModuleMenuTranslationDto> Translations { get; set; } = new();
    public List<ModuleMenuDto> Children { get; set; } = new();
}

public class ModuleMenuTranslationDto
{
    public Guid LanguageId { get; set; }
    public string Title { get; set; } = string.Empty;
}

public class GetModuleMenusQueryHandler : IRequestHandler<GetModuleMenusQuery, List<ModuleMenuDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetModuleMenusQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<ModuleMenuDto>> Handle(GetModuleMenusQuery request, CancellationToken cancellationToken)
    {
        var menus = await _context.ModuleMenus
            .Include(m => m.Translations)
            .Where(m => m.ModuleId == request.ModuleId && !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        var allDtos = menus.Select(m => new ModuleMenuDto
        {
            Id = m.Id,
            ModuleId = m.ModuleId,
            ParentId = m.ParentId,
            Path = m.Path,
            Icon = m.Icon,
            IconColor = m.IconColor,
            SortOrder = m.SortOrder,
            VisibleToTenant = m.VisibleToTenant,
            Translations = m.Translations.Select(t => new ModuleMenuTranslationDto
            {
                LanguageId = t.LanguageId,
                Title = t.Title
            }).ToList()
        }).ToList();

        // Build hierarchy
        var rootMenus = new List<ModuleMenuDto>();
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
