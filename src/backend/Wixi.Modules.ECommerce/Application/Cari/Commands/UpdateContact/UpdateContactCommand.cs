using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Cari.Commands.UpdateContact;

public record UpdateContactCommand(
    Guid Id,
    string Name,
    ContactType Type,
    string? TaxNumber,
    string? TaxOffice,
    string? Email,
    string? Phone,
    string? Address,
    string? City,
    string? ContactPersonName,
    string? Notes,
    bool IsActive
) : IRequest<bool>;

public class UpdateContactCommandHandler : IRequestHandler<UpdateContactCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateContactCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateContactCommand request, CancellationToken ct)
    {
        var updated = await _db.Contacts
            .Where(c => c.Id == request.Id && !c.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.Name, request.Name)
                .SetProperty(c => c.Type, request.Type)
                .SetProperty(c => c.TaxNumber, request.TaxNumber)
                .SetProperty(c => c.TaxOffice, request.TaxOffice)
                .SetProperty(c => c.Email, request.Email)
                .SetProperty(c => c.Phone, request.Phone)
                .SetProperty(c => c.Address, request.Address)
                .SetProperty(c => c.City, request.City)
                .SetProperty(c => c.ContactPersonName, request.ContactPersonName)
                .SetProperty(c => c.Notes, request.Notes)
                .SetProperty(c => c.IsActive, request.IsActive)
                .SetProperty(c => c.UpdatedAt, DateTime.UtcNow),
            ct);

        return updated > 0;
    }
}
