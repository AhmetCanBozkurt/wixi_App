using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.CorpPages.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageBySlug;

public class GetCorpPageBySlugQueryHandler : IRequestHandler<GetCorpPageBySlugQuery, CorpPageDto?>
{
    private readonly WebBuilderDbContext _db;

    public GetCorpPageBySlugQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<CorpPageDto?> Handle(GetCorpPageBySlugQuery request, CancellationToken cancellationToken)
    {
        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.TenantId == request.TenantId && p.Slug == request.Slug, cancellationToken);

        if (page is null) return null;

        return new CorpPageDto(
            page.Id,
            page.TenantId,
            page.PageType.ToString(),
            page.Slug,
            page.Title,
            page.LayoutConfigJson,
            page.ThemeOverrideJson,
            page.MetaTitle,
            page.MetaDescription,
            page.MetaKeywords,
            page.OpenGraphImageUrl,
            page.BacklinksJson,
            page.IsPublished,
            page.PublishedAt,
            page.CreatedAt,
            page.UpdatedAt);
    }
}
