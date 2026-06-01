using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.ECommerce.Application.Customers.Common;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.Modules.ECommerce.Application.Customers.Commands.ForgotPassword;

public class ForgotPasswordCustomerCommandHandler : IRequestHandler<ForgotPasswordCustomerCommand, Unit>
{
    private readonly ECommerceDbContext _db;
    private readonly IMailQueue _mailQueue;
    private readonly IConfiguration _configuration;
    private readonly TenantContext _tenantContext;

    public ForgotPasswordCustomerCommandHandler(
        ECommerceDbContext db,
        IMailQueue mailQueue,
        IConfiguration configuration,
        TenantContext tenantContext)
    {
        _db = db;
        _mailQueue = mailQueue;
        _configuration = configuration;
        _tenantContext = tenantContext;
    }

    public async Task<Unit> Handle(ForgotPasswordCustomerCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Email.ToLower() == email && c.IsActive && !c.IsDeleted, cancellationToken);

        // Enumeration koruması: müşteri bulunamazsa sessizce dön
        if (customer == null)
            return Unit.Value;

        var rawToken = ResetTokenHasher.GenerateRawToken();
        var tokenHash = ResetTokenHasher.HashToken(rawToken);

        // Aynı müşterinin eski aktif token'larını invalidate et
        var oldTokens = await _db.CustomerResetTokens
            .Where(t => t.CustomerId == customer.Id && t.UsedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var old in oldTokens)
            old.UsedAt = DateTime.UtcNow;

        // Yeni reset token oluştur
        _db.CustomerResetTokens.Add(new WixiCustomerResetToken
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(cancellationToken);

        var frontendBaseUrl = _configuration["AppUrls:FrontendBaseUrl"] ?? "http://localhost:5173";
        var tenantSlug = _tenantContext.Slug;
        var resetLink = $"{frontendBaseUrl}/store/{tenantSlug}/reset-password?token={rawToken}";

        var fullName = $"{customer.FirstName} {customer.LastName}".Trim();
        var body = $@"
<div style=""font-family: Arial, sans-serif; padding: 20px; color: #111827;"">
  <h2 style=""margin:0 0 8px 0;"">Şifrenizi Sıfırlayın</h2>
  <p style=""margin:0 0 14px 0;"">Merhaba {System.Net.WebUtility.HtmlEncode(fullName)},</p>
  <p style=""margin:0 0 14px 0;"">Hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
  <p style=""margin: 18px 0;"">
    <a href=""{resetLink}"" style=""display:inline-block; padding:12px 18px; background:#6366f1; color:#fff; text-decoration:none; border-radius:10px; font-weight:700;"">Şifremi Sıfırla</a>
  </p>
  <p style=""margin:0 0 8px 0; font-size: 0.92em; color:#374151;"">Bu bağlantı 1 saat geçerlidir.</p>
  <p style=""margin:0; font-size: 0.9em; color:#6b7280;"">
    Bu talebi siz yapmadıysanız, hesabınız güvendedir ve bu e-postayı dikkate almayabilirsiniz.
  </p>
</div>";

        await _mailQueue.QueueEmailAsync(new MailRequest(
            To: customer.Email,
            Subject: "Şifre Sıfırlama",
            Body: body
        ));

        return Unit.Value;
    }
}
