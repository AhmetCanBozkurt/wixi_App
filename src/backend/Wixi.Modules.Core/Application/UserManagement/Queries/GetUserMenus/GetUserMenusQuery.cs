using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.UserManagement.Queries.GetUserMenus;

public record GetUserMenusQuery(Guid UserId) : IRequest<List<UserMenuNodeDto>>;

public class GetUserMenusQueryHandler : IRequestHandler<GetUserMenusQuery, List<UserMenuNodeDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetUserMenusQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserMenuNodeDto>> Handle(GetUserMenusQuery request, CancellationToken cancellationToken)
    {
        var userMenus = await _context.Menus
            .Include(m => m.Translations)
            .ThenInclude(t => t.Language)
            .Where(m => m.UserId == request.UserId && !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        return userMenus.Select(m => new UserMenuNodeDto
        {
            Id = m.Id,
            ParentId = m.ParentId,
            SortOrder = m.SortOrder,
            IsVisible = m.IsVisible,
            Path = m.Path,
            Icon = m.Icon,
            IconColor = m.IconColor,
            Titles = m.Translations?.ToDictionary(t => t.Language?.Code ?? "tr", t => t.Title) ?? new Dictionary<string, string>()
        }).ToList();
    }
}
