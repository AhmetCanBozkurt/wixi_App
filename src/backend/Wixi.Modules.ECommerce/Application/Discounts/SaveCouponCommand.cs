using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Discounts;

public record SaveCouponCommand(
    Guid? Id, string Code, string Name,
    DiscountType DiscountType, decimal DiscountValue,
    decimal? MinOrderAmount, int? MaxUsageTotal, int? MaxUsagePerCustomer,
    DateTime? StartsAt, DateTime? ExpiresAt, bool IsActive
) : IRequest<Guid>;

public class SaveCouponCommandHandler : IRequestHandler<SaveCouponCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public SaveCouponCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(SaveCouponCommand request, CancellationToken ct)
    {
        var code = request.Code.ToUpperInvariant().Trim();

        if (request.Id is null)
        {
            var coupon = new WixiCoupon
            {
                Code = code, Name = request.Name,
                DiscountType = request.DiscountType, DiscountValue = request.DiscountValue,
                MinOrderAmount = request.MinOrderAmount, MaxUsageTotal = request.MaxUsageTotal,
                MaxUsagePerCustomer = request.MaxUsagePerCustomer,
                StartsAt = request.StartsAt, ExpiresAt = request.ExpiresAt,
                IsActive = request.IsActive
            };
            _db.Coupons.Add(coupon);
            await _db.SaveChangesAsync(ct);
            return coupon.Id;
        }

        await _db.Coupons.Where(c => c.Id == request.Id.Value)
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.Code, code)
                .SetProperty(c => c.Name, request.Name)
                .SetProperty(c => c.DiscountType, request.DiscountType)
                .SetProperty(c => c.DiscountValue, request.DiscountValue)
                .SetProperty(c => c.MinOrderAmount, request.MinOrderAmount)
                .SetProperty(c => c.MaxUsageTotal, request.MaxUsageTotal)
                .SetProperty(c => c.MaxUsagePerCustomer, request.MaxUsagePerCustomer)
                .SetProperty(c => c.StartsAt, request.StartsAt)
                .SetProperty(c => c.ExpiresAt, request.ExpiresAt)
                .SetProperty(c => c.IsActive, request.IsActive)
                .SetProperty(c => c.UpdatedAt, DateTime.UtcNow), ct);

        return request.Id.Value;
    }
}
