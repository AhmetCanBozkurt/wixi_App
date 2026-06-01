using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Newsletter.Commands;

public record SubscribeNewsletterCommand(string Email) : IRequest<Unit>;

public class SubscribeNewsletterCommandHandler : IRequestHandler<SubscribeNewsletterCommand, Unit>
{
    private readonly ECommerceDbContext _db;

    public SubscribeNewsletterCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Unit> Handle(SubscribeNewsletterCommand request, CancellationToken ct)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();

        var existing = await _db.NewsletterSubscriptions
            .FirstOrDefaultAsync(x => x.Email == normalizedEmail, ct);

        if (existing != null)
            throw new InvalidOperationException("Bu e-posta adresi zaten abone listesinde.");

        var subscription = new WixiNewsletterSubscription
        {
            Email = normalizedEmail,
            SubscribedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.NewsletterSubscriptions.Add(subscription);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
