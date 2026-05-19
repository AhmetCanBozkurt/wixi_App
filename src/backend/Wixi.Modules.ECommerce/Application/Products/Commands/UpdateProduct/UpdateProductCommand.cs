using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Products.Commands.UpdateProduct;

public record UpdateProductCommand(
    Guid Id,
    string Name,
    string Slug,
    decimal BasePrice,
    Guid? CategoryId,
    Guid? BrandId,
    string? ShortDescription,
    string? Description,
    string? MetaTitle,
    string? MetaDescription,
    string? MainImageUrl,
    IReadOnlyList<string>? GalleryUrls,
    bool TrackInventory,
    bool IsActive,
    int VatRate,
    decimal? CostPrice
) : IRequest<bool>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateProductCommandHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken ct)
    {
        var exists = await _db.Products
            .AnyAsync(p => p.Id == request.Id && !p.IsDeleted, ct);
        if (!exists) return false;

        await _db.Products
            .Where(p => p.Id == request.Id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(p => p.Name, request.Name)
                .SetProperty(p => p.Slug, request.Slug)
                .SetProperty(p => p.BasePrice, request.BasePrice)
                .SetProperty(p => p.CategoryId, request.CategoryId)
                .SetProperty(p => p.BrandId, request.BrandId)
                .SetProperty(p => p.ShortDescription, request.ShortDescription)
                .SetProperty(p => p.Description, request.Description)
                .SetProperty(p => p.MetaTitle, request.MetaTitle)
                .SetProperty(p => p.MetaDescription, request.MetaDescription)
                .SetProperty(p => p.TrackInventory, request.TrackInventory)
                .SetProperty(p => p.IsActive, request.IsActive)
                .SetProperty(p => p.VatRate, request.VatRate)
                .SetProperty(p => p.CostPrice, request.CostPrice)
                .SetProperty(p => p.UpdatedAt, DateTime.UtcNow),
                ct);

        await _db.ProductMedia
            .Where(m => m.ProductId == request.Id)
            .ExecuteDeleteAsync(ct);

        if (!string.IsNullOrWhiteSpace(request.MainImageUrl))
        {
            var now = DateTime.UtcNow;
            var mainId = Guid.NewGuid();
            await _db.Database.ExecuteSqlAsync(
                $"INSERT INTO WIXI_EC_PRODUCT_MEDIA (Id, ProductId, Url, AltText, SortOrder, MediaType, CreatedAt, IsActive, IsDeleted) VALUES ({mainId}, {request.Id}, {request.MainImageUrl}, {request.Name}, {0}, {0}, {now}, {true}, {false})",
                ct);

            if (request.GalleryUrls != null)
            {
                int order = 1;
                foreach (var url in request.GalleryUrls)
                {
                    if (url == request.MainImageUrl) continue;
                    var galleryId = Guid.NewGuid();
                    await _db.Database.ExecuteSqlAsync(
                        $"INSERT INTO WIXI_EC_PRODUCT_MEDIA (Id, ProductId, Url, AltText, SortOrder, MediaType, CreatedAt, IsActive, IsDeleted) VALUES ({galleryId}, {request.Id}, {url}, {request.Name}, {order++}, {0}, {now}, {true}, {false})",
                        ct);
                }
            }
        }

        return true;
    }
}
