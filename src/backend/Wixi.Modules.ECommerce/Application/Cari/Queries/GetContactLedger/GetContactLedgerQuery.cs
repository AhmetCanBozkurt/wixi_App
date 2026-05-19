using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Cari.Queries.GetContacts;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Cari.Queries.GetContactLedger;

public record LedgerEntryDto(
    Guid Id,
    LedgerEntryType EntryType,
    string EntryTypeLabel,
    decimal Amount,
    string? Description,
    string? ReferenceNo,
    DateTime MovementDate,
    decimal BalanceAfter
);

public record GetContactLedgerResult(
    ContactDto Contact,
    IReadOnlyList<LedgerEntryDto> Entries,
    int TotalCount,
    int Page,
    int PageSize
);

public record GetContactLedgerQuery(
    Guid ContactId,
    int Page = 1,
    int PageSize = 30
) : IRequest<GetContactLedgerResult?>;

public class GetContactLedgerQueryHandler : IRequestHandler<GetContactLedgerQuery, GetContactLedgerResult?>
{
    private readonly ECommerceDbContext _db;

    public GetContactLedgerQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<GetContactLedgerResult?> Handle(GetContactLedgerQuery request, CancellationToken ct)
    {
        var contact = await _db.Contacts
            .AsNoTracking()
            .Where(c => c.Id == request.ContactId && !c.IsDeleted)
            .Select(c => new ContactDto(
                c.Id,
                c.Name,
                c.Type,
                c.Type == ContactType.Supplier ? "Tedarikçi" :
                c.Type == ContactType.Customer ? "Müşteri" : "Bayi",
                c.TaxNumber,
                c.Email,
                c.Phone,
                c.City,
                c.ContactPersonName,
                c.Balance,
                c.IsActive
            ))
            .FirstOrDefaultAsync(ct);

        if (contact is null)
            return null;

        var ledgerQuery = _db.CariLedger
            .AsNoTracking()
            .Where(e => e.ContactId == request.ContactId);

        var totalCount = await ledgerQuery.CountAsync(ct);

        var entries = await ledgerQuery
            .OrderByDescending(e => e.MovementDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new LedgerEntryDto(
                e.Id,
                e.EntryType,
                e.EntryType == LedgerEntryType.Debit ? "Borç" : "Alacak",
                e.Amount,
                e.Description,
                e.ReferenceNo,
                e.MovementDate,
                e.BalanceAfter
            ))
            .ToListAsync(ct);

        return new GetContactLedgerResult(contact, entries, totalCount, request.Page, request.PageSize);
    }
}
