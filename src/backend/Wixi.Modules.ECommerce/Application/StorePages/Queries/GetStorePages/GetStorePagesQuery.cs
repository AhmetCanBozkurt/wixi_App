using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.StorePages.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Queries.GetStorePages;

public record GetStorePagesQuery(bool PublishedOnly = false) : IRequest<List<StorePageSummaryDto>>;

public class GetStorePagesQueryHandler : IRequestHandler<GetStorePagesQuery, List<StorePageSummaryDto>>
{
    private readonly ECommerceDbContext _db;

    public GetStorePagesQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<List<StorePageSummaryDto>> Handle(GetStorePagesQuery request, CancellationToken ct)
    {
        var query = _db.StorePages
            .AsNoTracking()
            .Where(p => !p.IsDeleted);

        if (request.PublishedOnly)
            query = query.Where(p => p.IsPublished && p.IsActive);

        return await query
            .OrderBy(p => p.PageType)
            .ThenBy(p => p.Title)
            .Select(p => new StorePageSummaryDto
            {
                Id = p.Id,
                PageType = p.PageType,
                Slug = p.Slug,
                Title = p.Title,
                IsPublished = p.IsPublished,
                PublishedAt = p.PublishedAt,
                UpdatedAt = p.UpdatedAt,
            })
            .ToListAsync(ct);
    }
}
