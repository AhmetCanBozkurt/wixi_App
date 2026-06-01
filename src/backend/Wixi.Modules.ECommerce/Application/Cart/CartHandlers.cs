using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Cart;

// ── DTOs ───────────────────────────────────────────────────────────────────────

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string ProductSlug,
    string? VariantName,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice
);

// ── Queries ────────────────────────────────────────────────────────────────────

public record GetCartQuery(Guid CustomerId) : IRequest<List<CartItemDto>>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, List<CartItemDto>>
{
    private readonly ECommerceDbContext _db;

    public GetCartQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<List<CartItemDto>> Handle(GetCartQuery request, CancellationToken ct)
    {
        return await _db.CartItems
            .AsNoTracking()
            .Where(x => x.CustomerId == request.CustomerId && !x.IsDeleted && x.IsActive)
            .Select(x => new CartItemDto(
                x.Id, x.ProductId, x.VariantId,
                x.ProductName, x.ProductSlug,
                x.VariantName, x.ImageUrl,
                x.UnitPrice, x.Quantity,
                x.UnitPrice * x.Quantity))
            .ToListAsync(ct);
    }
}

// ── Commands ───────────────────────────────────────────────────────────────────

public record AddToCartCommand(
    Guid CustomerId,
    Guid ProductId,
    Guid? VariantId,
    int Quantity = 1
) : IRequest<CartItemDto>;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, CartItemDto>
{
    private readonly ECommerceDbContext _db;

    public AddToCartCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<CartItemDto> Handle(AddToCartCommand request, CancellationToken ct)
    {
        // Get price from DB
        decimal price;
        string productName;
        string productSlug;
        string? variantName = null;
        string? imageUrl = null;

        if (request.VariantId.HasValue)
        {
            var variant = await _db.ProductVariants
                .Include(v => v.Product).ThenInclude(p => p.Media)
                .FirstOrDefaultAsync(v => v.Id == request.VariantId && !v.IsDeleted && v.IsActive, ct);

            if (variant == null)
                throw new InvalidOperationException("Ürün varyantı bulunamadı.");

            price = variant.Price;
            productName = variant.Product.Name;
            productSlug = variant.Product.Slug;
            variantName = variant.Name;
            imageUrl = variant.Product.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).FirstOrDefault();
        }
        else
        {
            var product = await _db.Products
                .Include(p => p.Media)
                .FirstOrDefaultAsync(p => p.Id == request.ProductId && !p.IsDeleted && p.IsActive, ct);

            if (product == null)
                throw new InvalidOperationException("Ürün bulunamadı.");

            price = product.BasePrice;
            productName = product.Name;
            productSlug = product.Slug;
            imageUrl = product.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).FirstOrDefault();
        }

        // Check if same product+variant already in cart
        var existing = await _db.CartItems.FirstOrDefaultAsync(
            x => x.CustomerId == request.CustomerId
              && x.ProductId == request.ProductId
              && x.VariantId == request.VariantId
              && !x.IsDeleted,
            ct);

        if (existing != null)
        {
            existing.Quantity += request.Quantity;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return new CartItemDto(
                existing.Id, existing.ProductId, existing.VariantId,
                existing.ProductName, existing.ProductSlug,
                existing.VariantName, existing.ImageUrl,
                existing.UnitPrice, existing.Quantity,
                existing.UnitPrice * existing.Quantity);
        }

        var item = new WixiCartItem
        {
            CustomerId = request.CustomerId,
            ProductId = request.ProductId,
            VariantId = request.VariantId,
            ProductName = productName,
            ProductSlug = productSlug,
            VariantName = variantName,
            ImageUrl = imageUrl,
            UnitPrice = price,
            Quantity = request.Quantity,
            CreatedAt = DateTime.UtcNow
        };

        _db.CartItems.Add(item);
        await _db.SaveChangesAsync(ct);

        return new CartItemDto(
            item.Id, item.ProductId, item.VariantId,
            item.ProductName, item.ProductSlug,
            item.VariantName, item.ImageUrl,
            item.UnitPrice, item.Quantity,
            item.UnitPrice * item.Quantity);
    }
}

public record UpdateCartItemCommand(Guid CartItemId, Guid CustomerId, int Quantity) : IRequest<Unit>;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, Unit>
{
    private readonly ECommerceDbContext _db;

    public UpdateCartItemCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Unit> Handle(UpdateCartItemCommand request, CancellationToken ct)
    {
        var item = await _db.CartItems.FirstOrDefaultAsync(
            x => x.Id == request.CartItemId && x.CustomerId == request.CustomerId && !x.IsDeleted, ct);

        if (item == null)
            throw new KeyNotFoundException("Sepet öğesi bulunamadı.");

        if (request.Quantity <= 0)
        {
            item.IsDeleted = true;
            item.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            item.Quantity = request.Quantity;
            item.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}

public record RemoveFromCartCommand(Guid CartItemId, Guid CustomerId) : IRequest<Unit>;

public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand, Unit>
{
    private readonly ECommerceDbContext _db;

    public RemoveFromCartCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Unit> Handle(RemoveFromCartCommand request, CancellationToken ct)
    {
        var item = await _db.CartItems.FirstOrDefaultAsync(
            x => x.Id == request.CartItemId && x.CustomerId == request.CustomerId && !x.IsDeleted, ct);

        if (item == null)
            throw new KeyNotFoundException("Sepet öğesi bulunamadı.");

        item.IsDeleted = true;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}

public record ClearCartCommand(Guid CustomerId) : IRequest<Unit>;

public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand, Unit>
{
    private readonly ECommerceDbContext _db;

    public ClearCartCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Unit> Handle(ClearCartCommand request, CancellationToken ct)
    {
        var items = await _db.CartItems
            .Where(x => x.CustomerId == request.CustomerId && !x.IsDeleted)
            .ToListAsync(ct);

        foreach (var item in items)
        {
            item.IsDeleted = true;
            item.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
