using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PackageType.Commands;

public record DeletePackageTypeCommand(Guid Id) : IRequest<bool>;

public class DeletePackageTypeCommandHandler : IRequestHandler<DeletePackageTypeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeletePackageTypeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeletePackageTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PackageTypes
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
