using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Landing.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicFaq;

public class GetPublicFaqQueryHandler : IRequestHandler<GetPublicFaqQuery, List<PublicFaqCategoryDto>>
{
    private readonly WixiCoreDbContext _db;

    public GetPublicFaqQueryHandler(WixiCoreDbContext db) => _db = db;

    public async Task<List<PublicFaqCategoryDto>> Handle(GetPublicFaqQuery request, CancellationToken ct)
    {
        var lang = request.Lang.ToLower().StartsWith("en") ? "en" : "tr";

        var categories = await _db.FaqCategories
            .Where(c => c.IsActive && !c.IsDeleted)
            .OrderBy(c => c.SortOrder)
            .Include(c => c.Translations).ThenInclude(t => t.Language)
            .Include(c => c.Faqs.Where(f => f.IsActive && !f.IsDeleted))
                .ThenInclude(f => f.Translations).ThenInclude(t => t.Language)
            .ToListAsync(ct);

        return categories.Select(cat =>
        {
            var catLabel = cat.Translations
                .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))?.Label
                ?? cat.Translations.FirstOrDefault()?.Label
                ?? cat.Slug;

            var items = cat.Faqs.OrderBy(f => f.SortOrder).Select(faq =>
            {
                var tr = faq.Translations
                    .FirstOrDefault(t => t.Language.Code.StartsWith(lang, StringComparison.OrdinalIgnoreCase))
                    ?? faq.Translations.FirstOrDefault();
                return new PublicFaqItemDto(faq.Id, tr?.Question ?? string.Empty, tr?.Answer ?? string.Empty);
            }).ToList();

            return new PublicFaqCategoryDto(cat.Slug, catLabel, items);
        }).ToList();
    }
}
