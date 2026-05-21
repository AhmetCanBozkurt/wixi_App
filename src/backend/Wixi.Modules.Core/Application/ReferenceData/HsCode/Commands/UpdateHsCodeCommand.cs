using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.HsCode.Commands;

public record UpdateHsCodeCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    HsCodeLevel Level,
    Guid? ParentId,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateHsCodeCommandHandler : IRequestHandler<UpdateHsCodeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateHsCodeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateHsCodeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.HsCodes.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Level = request.Level;
        entity.ParentId = request.ParentId;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
