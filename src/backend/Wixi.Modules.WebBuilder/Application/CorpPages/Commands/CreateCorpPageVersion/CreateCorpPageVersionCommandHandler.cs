using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.CreateCorpPageVersion;

public class CreateCorpPageVersionCommandHandler : IRequestHandler<CreateCorpPageVersionCommand, Guid>
{
    private readonly WebBuilderDbContext _db;

    public CreateCorpPageVersionCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(CreateCorpPageVersionCommand request, CancellationToken cancellationToken)
    {
        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.TenantId == request.TenantId, cancellationToken);

        if (page is null)
            throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        var version = new WixiCorpPageVersion
        {
            PageId = page.Id,
            TenantId = page.TenantId,
            LayoutConfigJson = page.LayoutConfigJson,
            ThemeOverrideJson = page.ThemeOverrideJson,
            CheckpointLabel = request.CheckpointLabel,
            CreatedAt = DateTime.UtcNow,
            CreatedByUser = page.CreatedByUser
        };

        _db.CorpPageVersions.Add(version);
        await _db.SaveChangesAsync(cancellationToken);

        return version.Id;
    }
}
