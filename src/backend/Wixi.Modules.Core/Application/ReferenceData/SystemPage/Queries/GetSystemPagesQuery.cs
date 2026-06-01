using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.SystemPage.Queries;

public record SystemPageDto(Guid Id, string Path, string Name, string? Group, string? Icon, int SortOrder, bool IsActive, DateTime CreatedAt, string? CreatedByUser, DateTime? UpdatedAt, string? UpdatedByUser);

public record GetSystemPagesQuery : IRequest<List<SystemPageDto>>;

public class GetSystemPagesQueryHandler : IRequestHandler<GetSystemPagesQuery, List<SystemPageDto>>
{
    private readonly WixiCoreDbContext _context;
    public GetSystemPagesQueryHandler(WixiCoreDbContext context) => _context = context;

    public async Task<List<SystemPageDto>> Handle(GetSystemPagesQuery request, CancellationToken cancellationToken)
    {
        var pages = await _context.SystemPages
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Group)
            .ThenBy(p => p.SortOrder)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return pages.Select(p => new SystemPageDto(p.Id, p.Path, p.Name, p.Group, p.Icon, p.SortOrder, p.IsActive, p.CreatedAt, p.CreatedByUser, p.UpdatedAt, p.UpdatedByUser)).ToList();
    }
}
