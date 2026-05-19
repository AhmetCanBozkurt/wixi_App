using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Products.Queries.GetProducts;

// ── DTO ────────────────────────────────────────────────────────────
public record ProductListDto(
    Guid Id,
    string Name,
    string Slug,
    decimal BasePrice,
    string? CategoryName,
    string? BrandName,
    int VariantCount,
    bool IsActive,
    bool TrackInventory,
    string? MainImageUrl,
    IReadOnlyList<string> GalleryUrls,
    DateTime CreatedAt,
    string? CreatedByUser,
    DateTime? UpdatedAt,
    string? UpdatedByUser,
    int VatRate,
    decimal? CostPrice
);

// ── Query ──────────────────────────────────────────────────────────
public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? CategoryId = null,
    Guid? BrandId = null,
    bool? IsActive = null,
    bool? IsFeatured = null,
    string? SortBy = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null
) : IRequest<GetProductsResult>;

public record GetProductsResult(
    IReadOnlyList<ProductListDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

// ── Handler ────────────────────────────────────────────────────────
public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, GetProductsResult>
{
    private readonly ECommerceDbContext _db;

    public GetProductsQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<GetProductsResult> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .Include(p => p.Media)
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) || p.Slug.ToLower().Contains(s));
        }
        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId);
        if (request.BrandId.HasValue)
            query = query.Where(p => p.BrandId == request.BrandId);
        if (request.IsActive.HasValue)
            query = query.Where(p => p.IsActive == request.IsActive);

        if (request.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == request.IsFeatured);

        if (request.MinPrice.HasValue)
            query = query.Where(p => p.BasePrice >= request.MinPrice.Value);
        if (request.MaxPrice.HasValue)
            query = query.Where(p => p.BasePrice <= request.MaxPrice.Value);

        var total = await query.CountAsync(ct);

        IQueryable<Wixi.Modules.ECommerce.Domain.Entities.WixiProduct> sortedQuery = request.SortBy switch
        {
            "price_asc"     => query.OrderBy(p => p.BasePrice),
            "price_desc"    => query.OrderByDescending(p => p.BasePrice),
            "recommended"   => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt),
            _               => query.OrderByDescending(p => p.CreatedAt)
        };

        var items = await sortedQuery
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductListDto(
                p.Id, p.Name, p.Slug, p.BasePrice,
                p.Category != null ? p.Category.Name : null,
                p.Brand != null ? p.Brand.Name : null,
                p.Variants.Count(v => !v.IsDeleted),
                p.IsActive, p.TrackInventory,
                p.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).FirstOrDefault(),
                p.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).ToList(),
                p.CreatedAt, p.CreatedByUser,
                p.UpdatedAt, p.UpdatedByUser,
                p.VatRate, p.CostPrice
            ))
            .ToListAsync(ct);

        return new GetProductsResult(items, total, request.Page, request.PageSize);
    }
}
