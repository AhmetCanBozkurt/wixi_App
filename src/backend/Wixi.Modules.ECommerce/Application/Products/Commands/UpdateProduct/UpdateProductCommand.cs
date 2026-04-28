using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.ECommerce.Domain.Entities;
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
    bool IsActive
) : IRequest<bool>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly ECommerceDbContext _db;
    private readonly IServiceScopeFactory _scopeFactory;

    public UpdateProductCommandHandler(ECommerceDbContext db, IServiceScopeFactory scopeFactory)
    {
        _db = db;
        _scopeFactory = scopeFactory;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken ct)
    {
        var product = await _db.Products
            .Include(p => p.Media)
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, ct);
            
        if (product is null) return false;

        product.Name = request.Name;
        product.Slug = request.Slug;
        product.BasePrice = request.BasePrice;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.ShortDescription = request.ShortDescription;
        product.Description = request.Description;
        product.MetaTitle = request.MetaTitle;
        product.MetaDescription = request.MetaDescription;
        product.TrackInventory = request.TrackInventory;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        // Update Media (Clear and Re-add for simplicity)
        product.Media.Clear();

        if (!string.IsNullOrWhiteSpace(request.MainImageUrl))
        {
            product.Media.Add(new WixiProductMedia
            {
                Url = request.MainImageUrl,
                SortOrder = 0,
                AltText = request.Name
            });
        }

        if (request.GalleryUrls != null)
        {
            int order = 1;
            foreach (var url in request.GalleryUrls)
            {
                if (url == request.MainImageUrl) continue;
                product.Media.Add(new WixiProductMedia
                {
                    Url = url,
                    SortOrder = order++,
                    AltText = request.Name
                });
            }
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
