using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Commands;

public record UpdateUnitCategoryCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateUnitCategoryCommandHandler : IRequestHandler<UpdateUnitCategoryCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateUnitCategoryCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUnitCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UnitCategories.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
