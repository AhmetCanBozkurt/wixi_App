using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Commands;

public record CreateUnitCategoryCommand(
    string Code,
    string Name,
    string? NameEn,
    int SortOrder,
    bool IsActive) : IRequest<Guid>;

public class CreateUnitCategoryCommandHandler : IRequestHandler<CreateUnitCategoryCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateUnitCategoryCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateUnitCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiUnitCategory
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.UnitCategories.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
