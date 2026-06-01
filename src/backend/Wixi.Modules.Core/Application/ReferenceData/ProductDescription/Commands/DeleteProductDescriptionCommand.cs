using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Commands;

public record DeleteProductDescriptionCommand(Guid Id) : IRequest<bool>;

public class DeleteProductDescriptionCommandHandler : IRequestHandler<DeleteProductDescriptionCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteProductDescriptionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteProductDescriptionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ProductDescriptions.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
