using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.UpdateWebForm;

public class UpdateWebFormCommandHandler : IRequestHandler<UpdateWebFormCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public UpdateWebFormCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateWebFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _db.WebForms
            .FirstOrDefaultAsync(f => f.Id == request.FormId && f.TenantId == request.TenantId, cancellationToken);

        if (form is null)
            throw new KeyNotFoundException($"Form bulunamadı: {request.FormId}");

        var slugConflict = await _db.WebForms
            .AnyAsync(f => f.TenantId == request.TenantId && f.Slug == request.Slug && f.Id != request.FormId, cancellationToken);

        if (slugConflict)
            throw new ArgumentException($"Bu tenant'ta '{request.Slug}' slug'ı başka bir formda kullanımda.");

        form.Name = request.Name;
        form.Slug = request.Slug;
        form.FieldsJson = request.FieldsJson;
        form.SubmitButtonText = request.SubmitButtonText;
        form.SuccessMessage = request.SuccessMessage;
        form.NotifyEmail = request.NotifyEmail;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
