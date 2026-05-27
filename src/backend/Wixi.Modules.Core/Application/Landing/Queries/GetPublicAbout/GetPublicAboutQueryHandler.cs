using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Landing.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicAbout;

public class GetPublicAboutQueryHandler : IRequestHandler<GetPublicAboutQuery, PublicAboutDto>
{
    private readonly WixiCoreDbContext _db;

    public GetPublicAboutQueryHandler(WixiCoreDbContext db) => _db = db;

    public async Task<PublicAboutDto> Handle(GetPublicAboutQuery request, CancellationToken ct)
    {
        var lang = request.Lang.ToLower().StartsWith("en") ? "en" : "tr";

        var members = await _db.TeamMembers
            .Where(m => m.IsActive && !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .Include(m => m.Translations).ThenInclude(t => t.Language)
            .ToListAsync(ct);

        var milestones = await _db.CompanyMilestones
            .Where(m => m.IsActive && !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .Include(m => m.Translations).ThenInclude(t => t.Language)
            .ToListAsync(ct);

        var teamDtos = members.Select(m =>
        {
            var tr = m.Translations
                .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))
                ?? m.Translations.FirstOrDefault();
            return new PublicTeamMemberDto(
                m.Id, m.FullName, m.Initials, m.AvatarUrl, m.AvatarColor,
                tr?.Role ?? string.Empty,
                tr?.Department ?? string.Empty);
        }).ToList();

        var milestoneDtos = milestones.Select(ms =>
        {
            var tr = ms.Translations
                .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))
                ?? ms.Translations.FirstOrDefault();
            return new PublicMilestoneDto(ms.Id, ms.Year, tr?.Title ?? string.Empty, tr?.Description);
        }).ToList();

        return new PublicAboutDto(teamDtos, milestoneDtos);
    }
}
