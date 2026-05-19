using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.CreateCheckpoint;

public record CreateCheckpointCommand(string Label, string? ChangedByEmail) : IRequest<int>;

public class CreateCheckpointCommandHandler : IRequestHandler<CreateCheckpointCommand, int>
{
    private readonly ECommerceDbContext _db;

    public CreateCheckpointCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<int> Handle(CreateCheckpointCommand request, CancellationToken ct)
    {
        var settings = await _db.StoreSettings.FirstOrDefaultAsync(ct);
        if (settings == null)
        {
            settings = new WixiStoreSettings { Id = Guid.NewGuid() };
            _db.StoreSettings.Add(settings);
            await _db.SaveChangesAsync(ct);
        }

        // Önceki published versiyonu kaldır
        await _db.ThemeVersions
            .Where(v => v.StoreSettingsId == settings.Id && v.IsPublished)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.IsPublished, false), ct);

        var maxVersion = await _db.ThemeVersions
            .Where(v => v.StoreSettingsId == settings.Id)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        var checkpoint = new WixiThemeVersion
        {
            StoreSettingsId = settings.Id,
            VersionNumber = maxVersion + 1,
            ThemeConfigJson = settings.ThemeConfigJson,
            GlobalComponentsConfigJson = settings.GlobalComponentsConfigJson,
            CustomCssOverride = settings.CustomCssOverride,
            CustomJsOverride = settings.CustomJsOverride,
            VersionLabel = request.Label,
            VersionType = "checkpoint",
            IsPublished = true,
            ChangedByEmail = request.ChangedByEmail,
            CreatedAt = DateTime.UtcNow,
        };

        _db.ThemeVersions.Add(checkpoint);
        await _db.SaveChangesAsync(ct);
        return checkpoint.Id;
    }
}
