using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.ThemeVersions.Queries.GetThemeVersions;

public record GetThemeVersionsQuery : IRequest<List<ThemeVersionSummaryDto>>;

public class GetThemeVersionsQueryHandler : IRequestHandler<GetThemeVersionsQuery, List<ThemeVersionSummaryDto>>
{
    private readonly ECommerceDbContext _db;

    public GetThemeVersionsQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<List<ThemeVersionSummaryDto>> Handle(GetThemeVersionsQuery request, CancellationToken ct)
    {
        return await _db.ThemeVersions
            .AsNoTracking()
            .OrderByDescending(v => v.VersionNumber)
            .Take(100)
            .Select(v => new ThemeVersionSummaryDto
            {
                Id = v.Id,
                VersionNumber = v.VersionNumber,
                VersionLabel = v.VersionLabel,
                VersionType = v.VersionType,
                IsPublished = v.IsPublished,
                RestoredFromVersionId = v.RestoredFromVersionId,
                ChangedByEmail = v.ChangedByEmail,
                CreatedAt = v.CreatedAt,
            })
            .ToListAsync(ct);
    }
}
