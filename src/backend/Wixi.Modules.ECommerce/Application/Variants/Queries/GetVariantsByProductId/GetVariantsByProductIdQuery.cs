using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Variants.Queries.GetVariantsByProductId;

public record VariantDto(
    Guid Id,
    Guid ProductId,
    string Name,
    string SKU,
    string? Barcode,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    int ReservedQuantity,
    int LowStockThreshold,
    decimal? WeightGrams,
    string AttributesJson,
    int SortOrder,
    bool IsActive
);

public record GetVariantsByProductIdQuery(Guid ProductId) : IRequest<IReadOnlyList<VariantDto>>;

public class GetVariantsByProductIdQueryHandler : IRequestHandler<GetVariantsByProductIdQuery, IReadOnlyList<VariantDto>>
{
    private readonly ECommerceDbContext _db;

    public GetVariantsByProductIdQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<VariantDto>> Handle(GetVariantsByProductIdQuery request, CancellationToken ct)
    {
        return await _db.ProductVariants
            .AsNoTracking()
            .Where(v => v.ProductId == request.ProductId && !v.IsDeleted)
            .OrderBy(v => v.SortOrder)
            .Select(v => new VariantDto(
                v.Id, v.ProductId, v.Name, v.SKU, v.Barcode,
                v.Price, v.CompareAtPrice, v.StockQuantity, v.ReservedQuantity,
                v.LowStockThreshold, v.WeightGrams, v.AttributesJson, v.SortOrder, v.IsActive))
            .ToListAsync(ct);
    }
}
