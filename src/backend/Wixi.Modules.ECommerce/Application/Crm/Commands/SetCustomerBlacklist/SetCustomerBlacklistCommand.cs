using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Crm.Commands.SetCustomerBlacklist;

public record SetCustomerBlacklistCommand(
    Guid CustomerId,
    bool IsBlacklisted,
    string? Reason) : IRequest<bool>;

public class SetCustomerBlacklistCommandHandler : IRequestHandler<SetCustomerBlacklistCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public SetCustomerBlacklistCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(SetCustomerBlacklistCommand request, CancellationToken ct)
    {
        // Kara listeye alırken sebep zorunlu
        if (request.IsBlacklisted && string.IsNullOrWhiteSpace(request.Reason))
            return false;

        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && !c.IsDeleted, ct);
        if (customer == null) return false;

        customer.IsBlacklisted = request.IsBlacklisted;
        customer.BlacklistReason = request.IsBlacklisted ? request.Reason!.Trim() : null;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
