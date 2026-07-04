using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Crm.Dto;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Crm.Commands.CreateCustomerNote;

public record CreateCustomerNoteCommand(
    Guid CustomerId,
    int NoteType,
    string Content,
    bool IsPrivate,
    string? CreatedByUser) : IRequest<CustomerNoteDto?>;

public class CreateCustomerNoteCommandHandler : IRequestHandler<CreateCustomerNoteCommand, CustomerNoteDto?>
{
    private readonly ECommerceDbContext _db;

    public CreateCustomerNoteCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<CustomerNoteDto?> Handle(CreateCustomerNoteCommand request, CancellationToken ct)
    {
        var customerExists = await _db.Customers
            .AnyAsync(c => c.Id == request.CustomerId && !c.IsDeleted, ct);
        if (!customerExists) return null;

        var note = new WixiCustomerNote
        {
            CustomerId = request.CustomerId,
            NoteType = (CustomerNoteType)request.NoteType,
            Content = request.Content.Trim(),
            IsPrivate = request.IsPrivate,
            CreatedByUser = request.CreatedByUser,
        };

        _db.CustomerNotes.Add(note);
        await _db.SaveChangesAsync(ct);

        return new CustomerNoteDto(
            note.Id, note.CustomerId, (int)note.NoteType, note.Content,
            note.IsPrivate, note.CreatedByUser, note.CreatedAt);
    }
}
