using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageVersions;

public class GetCorpPageVersionsQueryHandler : IRequestHandler<GetCorpPageVersionsQuery, List<CorpPageVersionDto>>
{
    private readonly WebBuilderDbContext _db;

    public GetCorpPageVersionsQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<List<CorpPageVersionDto>> Handle(GetCorpPageVersionsQuery request, CancellationToken cancellationToken)
    {
        return await _db.CorpPageVersions
            .Where(v => v.PageId == request.PageId && v.TenantId == request.TenantId)
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new CorpPageVersionDto(v.Id, v.CheckpointLabel, v.CreatedAt, v.CreatedByUser))
            .ToListAsync(cancellationToken);
    }
}
