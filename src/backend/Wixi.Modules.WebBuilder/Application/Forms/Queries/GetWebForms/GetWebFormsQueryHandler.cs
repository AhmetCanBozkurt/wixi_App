using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Forms.Queries.GetWebForms;

public class GetWebFormsQueryHandler : IRequestHandler<GetWebFormsQuery, List<WebFormListItemDto>>
{
    private readonly WebBuilderDbContext _db;

    public GetWebFormsQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<List<WebFormListItemDto>> Handle(GetWebFormsQuery request, CancellationToken cancellationToken)
    {
        return await _db.WebForms
            .Where(f => f.TenantId == request.TenantId)
            .OrderBy(f => f.Name)
            .Select(f => new WebFormListItemDto(f.Id, f.TenantId, f.Name, f.Slug, f.NotifyEmail, f.IsActive, f.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
