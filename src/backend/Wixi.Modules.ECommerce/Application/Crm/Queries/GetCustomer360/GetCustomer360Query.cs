using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Crm.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Crm.Queries.GetCustomer360;

public record GetCustomer360Query(Guid CustomerId) : IRequest<Customer360Dto?>;

public class GetCustomer360QueryHandler : IRequestHandler<GetCustomer360Query, Customer360Dto?>
{
    private readonly ECommerceDbContext _db;

    public GetCustomer360QueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<Customer360Dto?> Handle(GetCustomer360Query request, CancellationToken ct)
    {
        var c = await _db.Customers
            .AsNoTracking()
            .Include(x => x.Addresses.Where(a => !a.IsDeleted))
            .FirstOrDefaultAsync(x => x.Id == request.CustomerId && !x.IsDeleted, ct);

        if (c == null) return null;

        var recentOrders = await _db.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == c.Id && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new CustomerOrderSummaryDto(
                o.Id, o.OrderNumber, o.TotalAmount, o.Currency, (int)o.Status, o.CreatedAt))
            .ToListAsync(ct);

        var notes = await _db.CustomerNotes
            .AsNoTracking()
            .Where(n => n.CustomerId == c.Id && !n.IsDeleted)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new CustomerNoteDto(
                n.Id, n.CustomerId, (int)n.NoteType, n.Content, n.IsPrivate, n.CreatedByUser, n.CreatedAt))
            .ToListAsync(ct);

        var addresses = c.Addresses
            .Select(a => new CustomerAddressDto(
                a.Id, (int)a.AddressType, a.Title, a.AddressLine, a.City, a.District,
                a.CompanyName, a.TaxNumber, a.TaxOfficeName, a.IsDefault))
            .ToList();

        return new Customer360Dto(
            c.Id, c.FirstName, c.LastName, c.Email, c.PhoneNumber,
            c.IsEmailVerified, c.IsPhoneVerified, c.IsActive, c.IsGuest,
            c.BirthDate, (int)c.Gender, c.ProfileImagePath,
            c.EmailOptIn, c.SmsOptIn, c.PushOptIn, c.KvkkConsentDate,
            c.RfmSegment, c.LtvAmount, c.TotalOrders, c.LastOrderDate,
            c.IsBlacklisted, c.BlacklistReason,
            c.CreatedAt, c.UpdatedAt,
            recentOrders, notes, addresses);
    }
}
