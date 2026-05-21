using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Region.Commands;

public record UpdateRegionCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? Description,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateRegionCommandHandler : IRequestHandler<UpdateRegionCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateRegionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateRegionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Regions
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Description = request.Description;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
