using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Products.Queries.GetProductBySlug;

// ── DTOs ───────────────────────────────────────────────────────────
public record ProductVariantDto(
    Guid Id,
    string Name,
    string SKU,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    string AttributesJson,
    bool IsActive
);

public record ProductDetailDto(
    Guid Id,
    string Name,
    string Slug,
    decimal BasePrice,
    decimal? CompareAtPrice,
    int VatRate,
    decimal? CostPrice,
    string? ShortDescription,
    string? Description,
    string? CategoryName,
    Guid? CategoryId,
    string? BrandName,
    Guid? BrandId,
    bool IsActive,
    bool TrackInventory,
    bool IsFeatured,
    string? MainImageUrl,
    IReadOnlyList<string> GalleryUrls,
    IReadOnlyList<ProductVariantDto> Variants,
    string? MetaTitle,
    string? MetaDescription,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

// ── Query ──────────────────────────────────────────────────────────
public record GetProductBySlugQuery(string Slug) : IRequest<ProductDetailDto?>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductDetailDto?>
{
    private readonly ECommerceDbContext _db;

    public GetProductBySlugQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<ProductDetailDto?> Handle(GetProductBySlugQuery request, CancellationToken ct)
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

        var media = product.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).ToList();

        var variants = product.Variants
            .Where(v => !v.IsDeleted)
            .OrderBy(v => v.SortOrder)
            .Select(v => new ProductVariantDto(
                v.Id,
                v.Name,
                v.SKU,
                v.Price,
                v.CompareAtPrice,
                v.StockQuantity,
                v.AttributesJson,
                v.IsActive
            ))
            .ToList();

        return new ProductDetailDto(
            product.Id,
            product.Name,
            product.Slug,
            product.BasePrice,
            product.CompareAtPrice,
            product.VatRate,
            product.CostPrice,
            product.ShortDescription,
            product.Description,
            product.Category?.Name,
            product.CategoryId,
            product.Brand?.Name,
            product.BrandId,
            product.IsActive,
            product.TrackInventory,
            product.IsFeatured,
            media.FirstOrDefault(),
            media,
            variants,
            product.MetaTitle,
            product.MetaDescription,
            product.CreatedAt,
            product.UpdatedAt
        );
    }
}
