using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Discounts;

public record ApplyCouponResult(bool IsValid, string? Error, decimal DiscountAmount, Guid? CouponId);

public record ApplyCouponCommand(string Code, decimal OrderTotal) : IRequest<ApplyCouponResult>;

public class ApplyCouponCommandHandler : IRequestHandler<ApplyCouponCommand, ApplyCouponResult>
{
    private readonly ECommerceDbContext _db;
    public ApplyCouponCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<ApplyCouponResult> Handle(ApplyCouponCommand request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var coupon = await _db.Coupons
            .FirstOrDefaultAsync(c => c.Code == request.Code.ToUpperInvariant().Trim()
                && c.IsActive && !c.IsDeleted, ct);

        if (coupon is null) return new(false, "Kupon bulunamadı.", 0, null);
        if (coupon.StartsAt.HasValue && coupon.StartsAt.Value > now) return new(false, "Kupon henüz aktif değil.", 0, null);
        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < now) return new(false, "Kupon süresi dolmuş.", 0, null);
        if (coupon.MaxUsageTotal.HasValue && coupon.CurrentUsage >= coupon.MaxUsageTotal.Value) return new(false, "Kupon kullanım limiti doldu.", 0, null);
        if (coupon.MinOrderAmount.HasValue && request.OrderTotal < coupon.MinOrderAmount.Value)
            return new(false, $"Minimum sipariş tutarı ₺{coupon.MinOrderAmount:N2} olmalıdır.", 0, null);

        var discount = coupon.DiscountType switch
        {
            DiscountType.Percent     => Math.Min(request.OrderTotal * coupon.DiscountValue / 100m, request.OrderTotal),
            DiscountType.FixedAmount => Math.Min(coupon.DiscountValue, request.OrderTotal),
            _                        => 0m
        };

        return new(true, null, discount, coupon.Id);
    }
}
