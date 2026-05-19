using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.SaveThemeVersion;

public record SaveThemeVersionCommand(
    string VersionType,
    string? VersionLabel,
    string? ChangedByEmail,
    int? RestoredFromVersionId = null) : IRequest<int>;

public class SaveThemeVersionCommandHandler : IRequestHandler<SaveThemeVersionCommand, int>
{
    private readonly ECommerceDbContext _db;
    private const int MaxVersions = 50;

    public SaveThemeVersionCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<int> Handle(SaveThemeVersionCommand request, CancellationToken ct)
    {
        var settings = await _db.StoreSettings.FirstOrDefaultAsync(ct);
        if (settings == null) return 0;

        // Önceki published versiyonu kaldır
        await _db.ThemeVersions
            .Where(v => v.StoreSettingsId == settings.Id && v.IsPublished)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.IsPublished, false), ct);

        // Yeni versiyon numarası
        var maxVersion = await _db.ThemeVersions
            .Where(v => v.StoreSettingsId == settings.Id)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        var version = new WixiThemeVersion
        {
            StoreSettingsId = settings.Id,
            VersionNumber = maxVersion + 1,
            ThemeConfigJson = settings.ThemeConfigJson,
            GlobalComponentsConfigJson = settings.GlobalComponentsConfigJson,
            CustomCssOverride = settings.CustomCssOverride,
            CustomJsOverride = settings.CustomJsOverride,
            VersionLabel = request.VersionLabel,
            VersionType = request.VersionType,
            IsPublished = true,
            RestoredFromVersionId = request.RestoredFromVersionId,
            ChangedByEmail = request.ChangedByEmail,
            CreatedAt = DateTime.UtcNow,
        };

        _db.ThemeVersions.Add(version);
        await _db.SaveChangesAsync(ct);

        // Limit temizliği: sadece auto tipler silinir
        var autoVersions = await _db.ThemeVersions
            .Where(v => v.StoreSettingsId == settings.Id && v.VersionType == "auto")
            .OrderByDescending(v => v.VersionNumber)
            .Skip(MaxVersions)
            .Select(v => v.Id)
            .ToListAsync(ct);

        if (autoVersions.Count > 0)
        {
            await _db.ThemeVersions
                .Where(v => autoVersions.Contains(v.Id))
                .ExecuteDeleteAsync(ct);
        }

        return version.Id;
    }
}
