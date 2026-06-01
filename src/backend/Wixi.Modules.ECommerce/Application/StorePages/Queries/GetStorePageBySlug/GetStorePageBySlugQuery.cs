using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.StorePages.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Queries.GetStorePageBySlug;

public record GetStorePageBySlugQuery(string Slug, bool PublishedOnly = false) : IRequest<StorePageDto?>;

public class GetStorePageBySlugQueryHandler : IRequestHandler<GetStorePageBySlugQuery, StorePageDto?>
{
    private readonly ECommerceDbContext _db;

    public GetStorePageBySlugQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<StorePageDto?> Handle(GetStorePageBySlugQuery request, CancellationToken ct)
    {
        var query = _db.StorePages
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.Slug == request.Slug);

        if (request.PublishedOnly)
            query = query.Where(p => p.IsPublished && p.IsActive);

        return await query
            .Select(p => new StorePageDto
            {
                Id = p.Id,
                PageType = p.PageType,
                Slug = p.Slug,
                Title = p.Title,
                LayoutConfigJson = p.LayoutConfigJson,
                ThemeOverrideJson = p.ThemeOverrideJson,
                MetaTitle = p.MetaTitle,
                MetaDescription = p.MetaDescription,
                MetaKeywords = p.MetaKeywords,
                OpenGraphImageUrl = p.OpenGraphImageUrl,
                BacklinksJson = p.BacklinksJson,
                IsPublished = p.IsPublished,
                PublishedAt = p.PublishedAt,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
            })
            .FirstOrDefaultAsync(ct);
    }
}
