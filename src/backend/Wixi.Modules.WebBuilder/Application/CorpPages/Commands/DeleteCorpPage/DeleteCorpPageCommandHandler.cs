using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.DeleteCorpPage;

public class DeleteCorpPageCommandHandler : IRequestHandler<DeleteCorpPageCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public DeleteCorpPageCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteCorpPageCommand request, CancellationToken cancellationToken)
    {
        var page = await _db.CorpPages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && p.TenantId == request.TenantId, cancellationToken);

        if (page is null)
            throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.IsDeleted = true;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
