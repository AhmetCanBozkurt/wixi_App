using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageBacklinks;

public class UpdateCorpPageBacklinksCommandHandler : IRequestHandler<UpdateCorpPageBacklinksCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public UpdateCorpPageBacklinksCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateCorpPageBacklinksCommand request, CancellationToken cancellationToken)
    {
        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.TenantId == request.TenantId, cancellationToken);

        if (page is null)
            throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.BacklinksJson = request.BacklinksJson;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
