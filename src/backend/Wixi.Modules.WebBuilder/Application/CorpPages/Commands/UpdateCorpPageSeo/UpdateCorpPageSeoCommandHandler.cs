using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageSeo;

public class UpdateCorpPageSeoCommandHandler : IRequestHandler<UpdateCorpPageSeoCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public UpdateCorpPageSeoCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateCorpPageSeoCommand request, CancellationToken cancellationToken)
    {
        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.TenantId == request.TenantId, cancellationToken);

        if (page is null)
            throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.MetaTitle = request.MetaTitle;
        page.MetaDescription = request.MetaDescription;
        page.MetaKeywords = request.MetaKeywords;
        page.OpenGraphImageUrl = request.OpenGraphImageUrl;
        page.BacklinksJson = request.BacklinksJson;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
