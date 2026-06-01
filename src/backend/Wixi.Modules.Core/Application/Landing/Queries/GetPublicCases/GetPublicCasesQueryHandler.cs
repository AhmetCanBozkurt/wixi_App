using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Landing.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicCases;

public class GetPublicCasesQueryHandler : IRequestHandler<GetPublicCasesQuery, PublicCasesDto>
{
    private readonly WixiCoreDbContext _db;

    public GetPublicCasesQueryHandler(WixiCoreDbContext db) => _db = db;

    public async Task<PublicCasesDto> Handle(GetPublicCasesQuery request, CancellationToken ct)
    {
        var lang = request.Lang.ToLower().StartsWith("en") ? "en" : "tr";

        var query = _db.CaseStudies
            .Where(c => c.IsActive && !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Industry))
            query = query.Where(c => c.Industry == request.Industry);

        var cases = await query
            .OrderBy(c => c.SortOrder)
            .Include(c => c.Translations).ThenInclude(t => t.Language)
            .ToListAsync(ct);

        var dtos = cases.Select(c =>
        {
            var tr = c.Translations
                .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))
                ?? c.Translations.FirstOrDefault();
            return new PublicCaseStudyDto(
                c.Id, c.ClientSlug, c.ClientInitials, c.ClientLogoUrl,
                c.Industry,
                c.Metric1Value, tr?.Metric1Label ?? string.Empty,
                c.Metric2Value, tr?.Metric2Label ?? string.Empty,
                c.IsFeatured,
                tr?.ClientName ?? string.Empty,
                tr?.Title ?? string.Empty,
                tr?.Description ?? string.Empty,
                tr?.QuoteText,
                tr?.QuoteAuthor);
        }).ToList();

        var featured = dtos.FirstOrDefault(d => d.IsFeatured);

        return new PublicCasesDto(featured, dtos);
    }
}
