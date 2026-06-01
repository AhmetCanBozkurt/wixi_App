using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.CreateWebForm;

public class CreateWebFormCommandHandler : IRequestHandler<CreateWebFormCommand, WebFormDto>
{
    private readonly WebBuilderDbContext _db;

    public CreateWebFormCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<WebFormDto> Handle(CreateWebFormCommand request, CancellationToken cancellationToken)
    {
        var slugExists = await _db.WebForms
            .AnyAsync(f => f.TenantId == request.TenantId && f.Slug == request.Slug, cancellationToken);

        if (slugExists)
            throw new ArgumentException($"Bu tenant'ta '{request.Slug}' slug'ı zaten kullanımda.");

        var form = new WixiWebForm
        {
            TenantId = request.TenantId,
            Name = request.Name,
            Slug = request.Slug,
            FieldsJson = request.FieldsJson,
            SubmitButtonText = request.SubmitButtonText,
            SuccessMessage = request.SuccessMessage,
            NotifyEmail = request.NotifyEmail
        };

        _db.WebForms.Add(form);
        await _db.SaveChangesAsync(cancellationToken);

        return new WebFormDto(
            form.Id, form.TenantId, form.Name, form.Slug,
            form.FieldsJson, form.SubmitButtonText, form.SuccessMessage,
            form.NotifyEmail, form.IsActive, form.CreatedAt, form.UpdatedAt);
    }
}
