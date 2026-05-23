using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.DeleteWebForm;

public class DeleteWebFormCommandHandler : IRequestHandler<DeleteWebFormCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public DeleteWebFormCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteWebFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _db.WebForms
            .FirstOrDefaultAsync(f => f.Id == request.FormId && f.TenantId == request.TenantId, cancellationToken);

        if (form is null)
            throw new KeyNotFoundException($"Form bulunamadı: {request.FormId}");

        form.IsDeleted = true;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
