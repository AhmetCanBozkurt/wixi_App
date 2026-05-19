using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Customers.Common;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Customers.Commands.ResetPassword;

public class ResetPasswordCustomerCommandHandler : IRequestHandler<ResetPasswordCustomerCommand, Unit>
{
    private readonly ECommerceDbContext _db;

    public ResetPasswordCustomerCommandHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(ResetPasswordCustomerCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = ResetTokenHasher.HashToken(request.Token);

        var tokenRecord = await _db.CustomerResetTokens
            .Include(t => t.Customer)
            .FirstOrDefaultAsync(
                t => t.TokenHash == tokenHash
                     && t.UsedAt == null
                     && t.ExpiresAt > DateTime.UtcNow
                     && !t.Customer.IsDeleted,
                cancellationToken);

        if (tokenRecord == null)
            throw new InvalidOperationException("Token geçersiz veya süresi dolmuş.");

        if (request.NewPassword.Length < 8)
            throw new ArgumentException("Şifre en az 8 karakter olmalıdır.");

        tokenRecord.Customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        tokenRecord.Customer.UpdatedAt = DateTime.UtcNow;
        tokenRecord.UsedAt = DateTime.UtcNow;

        // Aynı müşterinin diğer aktif token'larını da invalidate et
        var otherTokens = await _db.CustomerResetTokens
            .Where(t => t.CustomerId == tokenRecord.CustomerId && t.Id != tokenRecord.Id && t.UsedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var other in otherTokens)
            other.UsedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
