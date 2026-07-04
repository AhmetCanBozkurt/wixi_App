using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Crm.Commands.UpdateCustomerConsent;

public record UpdateCustomerConsentCommand(
    Guid CustomerId,
    bool EmailOptIn,
    bool SmsOptIn,
    bool PushOptIn) : IRequest<bool>;

public class UpdateCustomerConsentCommandHandler : IRequestHandler<UpdateCustomerConsentCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateCustomerConsentCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateCustomerConsentCommand request, CancellationToken ct)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && !c.IsDeleted, ct);
        if (customer == null) return false;

        customer.EmailOptIn = request.EmailOptIn;
        customer.SmsOptIn = request.SmsOptIn;
        customer.PushOptIn = request.PushOptIn;
        // İlk izin verildiğinde KVKK onay tarihi damgalanır
        if ((request.EmailOptIn || request.SmsOptIn || request.PushOptIn) && customer.KvkkConsentDate == null)
            customer.KvkkConsentDate = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
