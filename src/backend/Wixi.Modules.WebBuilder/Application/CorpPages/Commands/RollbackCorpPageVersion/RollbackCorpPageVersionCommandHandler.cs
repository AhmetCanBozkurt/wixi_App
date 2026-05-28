using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.RollbackCorpPageVersion;

public class RollbackCorpPageVersionCommandHandler : IRequestHandler<RollbackCorpPageVersionCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public RollbackCorpPageVersionCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(RollbackCorpPageVersionCommand request, CancellationToken cancellationToken)
    {
        var version = await _db.CorpPageVersions
            .FirstOrDefaultAsync(v => v.Id == request.VersionId && v.TenantId == request.TenantId, cancellationToken);

        if (version is null)
            throw new KeyNotFoundException($"Versiyon bulunamadı: {request.VersionId}");

        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.Id == version.PageId && p.TenantId == request.TenantId, cancellationToken);

        if (page is null)
            throw new KeyNotFoundException($"Versiyona ait sayfa bulunamadı: {version.PageId}");

        page.LayoutConfigJson = version.LayoutConfigJson;
        page.ThemeOverrideJson = version.ThemeOverrideJson;
        page.IsPublished = true;
        page.PublishedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
