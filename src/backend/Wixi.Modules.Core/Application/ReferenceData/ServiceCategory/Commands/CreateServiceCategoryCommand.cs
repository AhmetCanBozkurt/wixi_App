using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Commands;

public record CreateServiceCategoryCommand(
    string Code,
    string Name,
    string? NameEn,
    string? Description,
    string? ColorHex,
    string? Icon,
    int SortOrder,
    bool IsActive) : IRequest<Guid>;

public class CreateServiceCategoryCommandHandler : IRequestHandler<CreateServiceCategoryCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateServiceCategoryCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiServiceCategory
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Description = request.Description,
            ColorHex = request.ColorHex,
            Icon = request.Icon,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.ServiceCategories.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
