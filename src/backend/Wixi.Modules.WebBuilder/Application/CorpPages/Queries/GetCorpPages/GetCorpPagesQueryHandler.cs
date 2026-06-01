using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.CorpPages.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPages;

public class GetCorpPagesQueryHandler : IRequestHandler<GetCorpPagesQuery, List<CorpPageListItemDto>>
{
    private readonly WebBuilderDbContext _db;

    public GetCorpPagesQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<List<CorpPageListItemDto>> Handle(GetCorpPagesQuery request, CancellationToken cancellationToken)
    {
        return await _db.CorpPages
            .Where(p => p.TenantId == request.TenantId)
            .OrderBy(p => p.Title)
            .Select(p => new CorpPageListItemDto(
                p.Id,
                p.Slug,
                p.Title,
                p.PageType.ToString(),
                p.IsPublished,
                p.PublishedAt,
                p.UpdatedAt))
            .ToListAsync(cancellationToken);
    }
}
