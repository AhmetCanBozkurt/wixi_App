using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Variants.Commands.CreateVariant;

public record CreateVariantCommand(
    Guid ProductId,
    string Name,
    string SKU,
    decimal Price,
    decimal? CompareAtPrice = null,
    int StockQuantity = 0,
    int LowStockThreshold = 5,
    decimal? WeightGrams = null,
    string AttributesJson = "{}",
    int SortOrder = 0,
    bool IsActive = true
) : IRequest<Guid>;

public class CreateVariantCommandHandler : IRequestHandler<CreateVariantCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public CreateVariantCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateVariantCommand request, CancellationToken ct)
    {
        var productExists = await _db.Products.AnyAsync(p => p.Id == request.ProductId && !p.IsDeleted, ct);
        if (!productExists)
            throw new InvalidOperationException("Ürün bulunamadı.");

        var variant = new WixiProductVariant
        {
            ProductId = request.ProductId,
            Name = request.Name,
            SKU = request.SKU,
            Price = request.Price,
            CompareAtPrice = request.CompareAtPrice,
            StockQuantity = request.StockQuantity,
            LowStockThreshold = request.LowStockThreshold,
            WeightGrams = request.WeightGrams,
            AttributesJson = string.IsNullOrWhiteSpace(request.AttributesJson) ? "{}" : request.AttributesJson,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _db.ProductVariants.Add(variant);
        await _db.SaveChangesAsync(ct);
        return variant.Id;
    }
}
