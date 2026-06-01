using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Variants.Commands.UpdateVariant;

public record UpdateVariantCommand(
    Guid Id,
    string Name,
    string SKU,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    int LowStockThreshold,
    decimal? WeightGrams,
    string AttributesJson,
    int SortOrder,
    bool IsActive
) : IRequest<bool>;

public class UpdateVariantCommandHandler : IRequestHandler<UpdateVariantCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateVariantCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateVariantCommand request, CancellationToken ct)
    {
        var exists = await _db.ProductVariants.AnyAsync(v => v.Id == request.Id && !v.IsDeleted, ct);
        if (!exists) return false;

        await _db.ProductVariants
            .Where(v => v.Id == request.Id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(v => v.Name, request.Name)
                .SetProperty(v => v.SKU, request.SKU)
                .SetProperty(v => v.Price, request.Price)
                .SetProperty(v => v.CompareAtPrice, request.CompareAtPrice)
                .SetProperty(v => v.StockQuantity, request.StockQuantity)
                .SetProperty(v => v.LowStockThreshold, request.LowStockThreshold)
                .SetProperty(v => v.WeightGrams, request.WeightGrams)
                .SetProperty(v => v.AttributesJson, string.IsNullOrWhiteSpace(request.AttributesJson) ? "{}" : request.AttributesJson)
                .SetProperty(v => v.SortOrder, request.SortOrder)
                .SetProperty(v => v.IsActive, request.IsActive)
                .SetProperty(v => v.UpdatedAt, DateTime.UtcNow),
                ct);

        return true;
    }
}
