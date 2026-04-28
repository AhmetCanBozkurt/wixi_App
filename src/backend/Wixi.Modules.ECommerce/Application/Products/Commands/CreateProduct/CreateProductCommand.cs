using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Products.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    string Slug,
    decimal BasePrice,
    Guid? CategoryId,
    Guid? BrandId,
    string? ShortDescription,
    string? Description,
    string? MetaTitle,
    string? MetaDescription,
    string? MainImageUrl = null,
    IReadOnlyList<string>? GalleryUrls = null,
    bool TrackInventory = true
) : IRequest<Guid>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public CreateProductCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken ct)
    {
        var product = new WixiProduct
        {
            Name = request.Name,
            Slug = request.Slug,
            BasePrice = request.BasePrice,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            TrackInventory = request.TrackInventory
        };

        // Add Main Image
        if (!string.IsNullOrWhiteSpace(request.MainImageUrl))
        {
            product.Media.Add(new WixiProductMedia
            {
                Url = request.MainImageUrl,
                SortOrder = 0,
                AltText = request.Name
            });
        }

        // Add Gallery Images
        if (request.GalleryUrls != null)
        {
            int order = 1;
            foreach (var url in request.GalleryUrls)
            {
                if (url == request.MainImageUrl) continue; // Skip if already added as main
                product.Media.Add(new WixiProductMedia
                {
                    Url = url,
                    SortOrder = order++,
                    AltText = request.Name
                });
            }
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);
        return product.Id;
    }
}
