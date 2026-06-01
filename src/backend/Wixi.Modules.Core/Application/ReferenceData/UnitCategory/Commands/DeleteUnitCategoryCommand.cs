using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Commands;

public record DeleteUnitCategoryCommand(Guid Id) : IRequest<bool>;

public class DeleteUnitCategoryCommandHandler : IRequestHandler<DeleteUnitCategoryCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteUnitCategoryCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteUnitCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UnitCategories.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
