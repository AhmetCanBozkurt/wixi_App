using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Landing.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicRoadmap;

public class GetPublicRoadmapQueryHandler : IRequestHandler<GetPublicRoadmapQuery, PublicRoadmapDto>
{
    private static readonly string[] PhaseOrder = ["shipped", "now", "next", "later"];

    private readonly WixiCoreDbContext _db;

    public GetPublicRoadmapQueryHandler(WixiCoreDbContext db) => _db = db;

    public async Task<PublicRoadmapDto> Handle(GetPublicRoadmapQuery request, CancellationToken ct)
    {
        var lang = request.Lang.ToLower().StartsWith("en") ? "en" : "tr";

        var items = await _db.RoadmapItems
            .Where(i => i.IsActive && !i.IsDeleted)
            .OrderBy(i => i.SortOrder)
            .Include(i => i.Translations).ThenInclude(t => t.Language)
            .ToListAsync(ct);

        var changelog = await _db.ChangelogEntries
            .Where(e => e.IsActive && !e.IsDeleted)
            .OrderByDescending(e => e.ReleaseDate)
            .Include(e => e.Translations).ThenInclude(t => t.Language)
            .ToListAsync(ct);

        var phases = PhaseOrder
            .Select(phaseId =>
            {
                var phaseItems = items
                    .Where(i => i.Phase == phaseId)
                    .Select(i =>
                    {
                        var tr = i.Translations
                            .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))
                            ?? i.Translations.FirstOrDefault();
                        return new PublicRoadmapItemDto(
                            i.Id, i.Category, i.PlannedDate, i.VoteCount, i.IsShipped,
                            tr?.Title ?? string.Empty,
                            tr?.Description ?? string.Empty);
                    }).ToList();

                var phaseLabel = items
                    .FirstOrDefault(i => i.Phase == phaseId)?.PhaseLabel ?? phaseId;

                return new PublicRoadmapPhaseDto(phaseId, phaseLabel, phaseItems);
            })
            .Where(p => p.Items.Count > 0)
            .ToList();

        var changelogDtos = changelog.Select(e =>
        {
            var tr = e.Translations
                .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))
                ?? e.Translations.FirstOrDefault();
            return new PublicChangelogDto(
                e.Id, e.Version,
                e.ReleaseDate.ToString("yyyy-MM-dd"),
                e.Tag,
                tr?.Title ?? string.Empty,
                tr?.Description ?? string.Empty);
        }).ToList();

        return new PublicRoadmapDto(phases, changelogDtos);
    }
}
