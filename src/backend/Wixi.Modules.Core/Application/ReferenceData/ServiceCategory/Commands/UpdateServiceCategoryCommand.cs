using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Commands;

public record UpdateServiceCategoryCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? Description,
    string? ColorHex,
    string? Icon,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateServiceCategoryCommandHandler : IRequestHandler<UpdateServiceCategoryCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateServiceCategoryCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ServiceCategories.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Description = request.Description;
        entity.ColorHex = request.ColorHex;
        entity.Icon = request.Icon;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
