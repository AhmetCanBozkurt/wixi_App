using MediatR;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Cari.Commands.CreateContact;

public record CreateContactCommand(
    string Name,
    ContactType Type,
    string? TaxNumber,
    string? TaxOffice,
    string? Email,
    string? Phone,
    string? Address,
    string? City,
    string? ContactPersonName,
    string? Notes
) : IRequest<Guid>;

public class CreateContactCommandHandler : IRequestHandler<CreateContactCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public CreateContactCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateContactCommand request, CancellationToken ct)
    {
        var contact = new WixiContact
        {
            Name = request.Name,
            Type = request.Type,
            TaxNumber = request.TaxNumber,
            TaxOffice = request.TaxOffice,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            City = request.City,
            ContactPersonName = request.ContactPersonName,
            Notes = request.Notes
        };

        _db.Contacts.Add(contact);
        await _db.SaveChangesAsync(ct);
        return contact.Id;
    }
}
