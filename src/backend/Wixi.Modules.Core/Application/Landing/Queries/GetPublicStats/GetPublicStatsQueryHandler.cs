using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Landing.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicStats;

public class GetPublicStatsQueryHandler : IRequestHandler<GetPublicStatsQuery, List<PublicStatDto>>
{
    private readonly WixiCoreDbContext _db;

    public GetPublicStatsQueryHandler(WixiCoreDbContext db) => _db = db;

    public async Task<List<PublicStatDto>> Handle(GetPublicStatsQuery request, CancellationToken ct)
    {
        var lang = request.Lang.ToLower().StartsWith("en") ? "en" : "tr";

        var stats = await _db.PlatformStats
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .Include(s => s.Translations).ThenInclude(t => t.Language)
            .ToListAsync(ct);

        return stats.Select(s =>
        {
            var label = s.Translations
                .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))?.Label
                ?? s.Translations.FirstOrDefault()?.Label
                ?? s.StatKey;
            return new PublicStatDto(s.StatKey, s.DisplayValue, label);
        }).ToList();
    }
}
