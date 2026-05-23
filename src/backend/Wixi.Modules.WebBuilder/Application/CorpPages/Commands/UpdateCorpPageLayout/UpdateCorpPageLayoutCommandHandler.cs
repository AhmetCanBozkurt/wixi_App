using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageLayout;

public class UpdateCorpPageLayoutCommandHandler : IRequestHandler<UpdateCorpPageLayoutCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public UpdateCorpPageLayoutCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateCorpPageLayoutCommand request, CancellationToken cancellationToken)
    {
        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.TenantId == request.TenantId, cancellationToken);

        if (page is null)
            throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.LayoutConfigJson = request.LayoutConfigJson;
        page.ThemeOverrideJson = request.ThemeOverrideJson;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
