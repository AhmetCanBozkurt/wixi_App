using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Cari.Commands.CreateLedgerEntry;

public record CreateLedgerEntryCommand(
    Guid ContactId,
    LedgerEntryType EntryType,
    decimal Amount,
    string? Description,
    string? ReferenceNo,
    DateTime? MovementDate
) : IRequest<Guid>;

public class CreateLedgerEntryCommandHandler : IRequestHandler<CreateLedgerEntryCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public CreateLedgerEntryCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateLedgerEntryCommand request, CancellationToken ct)
    {
        var contact = await _db.Contacts
            .FirstOrDefaultAsync(c => c.Id == request.ContactId && !c.IsDeleted, ct)
            ?? throw new InvalidOperationException($"Contact {request.ContactId} bulunamadi.");

        var newBalance = request.EntryType == LedgerEntryType.Debit
            ? contact.Balance + request.Amount
            : contact.Balance - request.Amount;

        var entry = new WixiCariLedger
        {
            ContactId = request.ContactId,
            EntryType = request.EntryType,
            Amount = request.Amount,
            Description = request.Description,
            ReferenceNo = request.ReferenceNo,
            MovementDate = request.MovementDate ?? DateTime.UtcNow,
            BalanceAfter = newBalance
        };

        contact.Balance = newBalance;
        contact.UpdatedAt = DateTime.UtcNow;

        _db.CariLedger.Add(entry);
        await _db.SaveChangesAsync(ct);
        return entry.Id;
    }
}
