using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.ThemeVersions.Queries.GetThemeVersionById;

public record GetThemeVersionByIdQuery(int Id) : IRequest<ThemeVersionDetailDto?>;

public class GetThemeVersionByIdQueryHandler : IRequestHandler<GetThemeVersionByIdQuery, ThemeVersionDetailDto?>
{
    private readonly ECommerceDbContext _db;

    public GetThemeVersionByIdQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<ThemeVersionDetailDto?> Handle(GetThemeVersionByIdQuery request, CancellationToken ct)
    {
        var v = await _db.ThemeVersions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (v == null) return null;
        return new ThemeVersionDetailDto
        {
            Id = v.Id,
            VersionNumber = v.VersionNumber,
            VersionLabel = v.VersionLabel,
            VersionType = v.VersionType,
            IsPublished = v.IsPublished,
            RestoredFromVersionId = v.RestoredFromVersionId,
            ChangedByEmail = v.ChangedByEmail,
            CreatedAt = v.CreatedAt,
            ThemeConfigJson = v.ThemeConfigJson,
            GlobalComponentsConfigJson = v.GlobalComponentsConfigJson,
            CustomCssOverride = v.CustomCssOverride,
            CustomJsOverride = v.CustomJsOverride,
        };
    }
}
