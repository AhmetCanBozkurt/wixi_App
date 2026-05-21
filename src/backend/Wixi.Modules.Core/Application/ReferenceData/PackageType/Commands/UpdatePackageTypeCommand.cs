using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PackageType.Commands;

public record UpdatePackageTypeCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? Symbol,
    bool IsStackable,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdatePackageTypeCommandHandler : IRequestHandler<UpdatePackageTypeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdatePackageTypeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdatePackageTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PackageTypes
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Symbol = request.Symbol;
        entity.IsStackable = request.IsStackable;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
