using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Discounts;

public record CouponDto(
    Guid Id, string Code, string Name,
    DiscountType DiscountType, string DiscountTypeName,
    decimal DiscountValue, decimal? MinOrderAmount,
    int? MaxUsageTotal, int? MaxUsagePerCustomer, int CurrentUsage,
    DateTime? StartsAt, DateTime? ExpiresAt, bool IsActive, bool IsExpired
);

public record GetCouponsQuery : IRequest<IReadOnlyList<CouponDto>>;

public class GetCouponsQueryHandler : IRequestHandler<GetCouponsQuery, IReadOnlyList<CouponDto>>
{
    private readonly ECommerceDbContext _db;
    public GetCouponsQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<CouponDto>> Handle(GetCouponsQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        return await _db.Coupons
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CouponDto(
                c.Id, c.Code, c.Name,
                c.DiscountType,
                c.DiscountType == DiscountType.Percent ? "Yüzde"
                    : c.DiscountType == DiscountType.FixedAmount ? "Sabit Tutar"
                    : "Ücretsiz Kargo",
                c.DiscountValue, c.MinOrderAmount,
                c.MaxUsageTotal, c.MaxUsagePerCustomer, c.CurrentUsage,
                c.StartsAt, c.ExpiresAt, c.IsActive,
                c.ExpiresAt.HasValue && c.ExpiresAt.Value < now))
            .ToListAsync(ct);
    }
}
