using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Products.Queries.GetProducts;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Products.Queries.GetProductBySlug;

public record GetProductBySlugQuery(string Slug) : IRequest<ProductListDto?>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductListDto?>
{
    private readonly ECommerceDbContext _db;

    public GetProductBySlugQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<ProductListDto?> Handle(GetProductBySlugQuery request, CancellationToken ct)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .Include(p => p.Media)
            .Where(p => p.Slug == request.Slug && p.IsActive && !p.IsDeleted)
            .FirstOrDefaultAsync(ct);

        if (product == null)
            return null;

        return new ProductListDto(
            product.Id,
            product.Name,
            product.Slug,
            product.BasePrice,
            product.Category?.Name,
            product.Brand?.Name,
            product.Variants.Count(v => !v.IsDeleted),
            product.IsActive,
            product.TrackInventory,
            product.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).FirstOrDefault(),
            product.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).ToList(),
            product.CreatedAt,
            product.CreatedByUser,
            product.UpdatedAt,
            product.UpdatedByUser
        );
    }
}
