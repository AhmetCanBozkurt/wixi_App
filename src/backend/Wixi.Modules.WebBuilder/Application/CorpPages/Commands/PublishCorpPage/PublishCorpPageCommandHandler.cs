using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.PublishCorpPage;

public class PublishCorpPageCommandHandler : IRequestHandler<PublishCorpPageCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public PublishCorpPageCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(PublishCorpPageCommand request, CancellationToken cancellationToken)
    {
        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.TenantId == request.TenantId, cancellationToken);

        if (page is null)
            throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.IsPublished = request.IsPublished;

        if (request.IsPublished && page.PublishedAt is null)
            page.PublishedAt = DateTime.UtcNow;
        else if (!request.IsPublished)
            page.PublishedAt = null;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
