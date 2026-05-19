using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Cari.Queries.GetContacts;

public record ContactDto(
    Guid Id,
    string Name,
    ContactType Type,
    string TypeLabel,
    string? TaxNumber,
    string? Email,
    string? Phone,
    string? City,
    string? ContactPersonName,
    decimal Balance,
    bool IsActive
);

public record GetContactsQuery(
    string? Search = null,
    ContactType? Type = null,
    bool? IsActive = null
) : IRequest<IReadOnlyList<ContactDto>>;

public class GetContactsQueryHandler : IRequestHandler<GetContactsQuery, IReadOnlyList<ContactDto>>
{
    private readonly ECommerceDbContext _db;

    public GetContactsQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<ContactDto>> Handle(GetContactsQuery request, CancellationToken ct)
    {
        var query = _db.Contacts
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(search) ||
                (c.Email != null && c.Email.ToLower().Contains(search)) ||
                (c.TaxNumber != null && c.TaxNumber.Contains(search)));
        }

        if (request.Type.HasValue)
            query = query.Where(c => c.Type == request.Type.Value);

        if (request.IsActive.HasValue)
            query = query.Where(c => c.IsActive == request.IsActive.Value);

        return await query
            .OrderBy(c => c.Name)
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
            .ToListAsync(ct);
    }
}
