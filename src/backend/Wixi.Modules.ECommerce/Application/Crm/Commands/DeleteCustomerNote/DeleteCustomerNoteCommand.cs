using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Crm.Commands.DeleteCustomerNote;

public record DeleteCustomerNoteCommand(Guid NoteId) : IRequest<bool>;

public class DeleteCustomerNoteCommandHandler : IRequestHandler<DeleteCustomerNoteCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public DeleteCustomerNoteCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(DeleteCustomerNoteCommand request, CancellationToken ct)
    {
        var note = await _db.CustomerNotes
            .FirstOrDefaultAsync(n => n.Id == request.NoteId && !n.IsDeleted, ct);
        if (note == null) return false;

        note.IsDeleted = true;
        note.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
