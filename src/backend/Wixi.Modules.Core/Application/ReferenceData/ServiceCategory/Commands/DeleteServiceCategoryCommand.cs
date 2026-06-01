using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Commands;

public record DeleteServiceCategoryCommand(Guid Id) : IRequest<bool>;

public class DeleteServiceCategoryCommandHandler : IRequestHandler<DeleteServiceCategoryCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteServiceCategoryCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ServiceCategories.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
