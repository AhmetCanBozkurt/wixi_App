using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Forms.Queries.GetWebFormBySlug;

public class GetWebFormBySlugQueryHandler : IRequestHandler<GetWebFormBySlugQuery, WebFormDto?>
{
    private readonly WebBuilderDbContext _db;

    public GetWebFormBySlugQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<WebFormDto?> Handle(GetWebFormBySlugQuery request, CancellationToken cancellationToken)
    {
        var form = await _db.WebForms
            .FirstOrDefaultAsync(f => f.TenantId == request.TenantId && f.Slug == request.Slug, cancellationToken);

        if (form is null) return null;

        return new WebFormDto(
            form.Id, form.TenantId, form.Name, form.Slug,
            form.FieldsJson, form.SubmitButtonText, form.SuccessMessage,
            form.NotifyEmail, form.IsActive, form.CreatedAt, form.UpdatedAt);
    }
}
