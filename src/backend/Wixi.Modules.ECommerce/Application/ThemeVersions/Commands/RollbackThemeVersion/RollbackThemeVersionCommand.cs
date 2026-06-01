using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.SaveThemeVersion;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.RollbackThemeVersion;

public record RollbackThemeVersionCommand(int VersionId, string? ChangedByEmail) : IRequest<bool>;

public class RollbackThemeVersionCommandHandler : IRequestHandler<RollbackThemeVersionCommand, bool>
{
    private readonly ECommerceDbContext _db;
    private readonly IMediator _mediator;

    public RollbackThemeVersionCommandHandler(ECommerceDbContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
    }

    public async Task<bool> Handle(RollbackThemeVersionCommand request, CancellationToken ct)
    {
        var targetVersion = await _db.ThemeVersions
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == request.VersionId, ct);

        if (targetVersion == null) return false;

        var settings = await _db.StoreSettings.FirstOrDefaultAsync(ct);
        if (settings == null) return false;

        // Eski snapshot'ı mevcut settings'e uygula
        settings.ThemeConfigJson = targetVersion.ThemeConfigJson;
        settings.GlobalComponentsConfigJson = targetVersion.GlobalComponentsConfigJson;
        settings.CustomCssOverride = targetVersion.CustomCssOverride;
        settings.CustomJsOverride = targetVersion.CustomJsOverride;
        settings.UpdatedAt = DateTime.UtcNow;
        settings.UpdatedByUser = request.ChangedByEmail;
        await _db.SaveChangesAsync(ct);

        // Rollback tipi versiyon oluştur
        await _mediator.Send(new SaveThemeVersionCommand(
            VersionType: "rollback",
            VersionLabel: $"v{targetVersion.VersionNumber}'den geri alındı",
            ChangedByEmail: request.ChangedByEmail,
            RestoredFromVersionId: request.VersionId), ct);

        return true;
    }
}
