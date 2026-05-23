using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Forms.Queries.GetFormSubmissions;

public class GetFormSubmissionsQueryHandler : IRequestHandler<GetFormSubmissionsQuery, PagedResult<WebFormSubmissionDto>>
{
    private readonly WebBuilderDbContext _db;

    public GetFormSubmissionsQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<WebFormSubmissionDto>> Handle(GetFormSubmissionsQuery request, CancellationToken cancellationToken)
    {
        var baseQuery = _db.WebFormSubmissions
            .Where(s => s.FormId == request.FormId && s.TenantId == request.TenantId);

        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var items = await baseQuery
            .OrderByDescending(s => s.CreatedAt)
            .Skip(request.Skip)
            .Take(request.Take)
            .Select(s => new WebFormSubmissionDto(s.Id, s.FormId, s.TenantId, s.DataJson, s.IpAddress, s.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<WebFormSubmissionDto>(items, totalCount, request.Skip, request.Take);
    }
}
