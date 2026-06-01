using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Service.Commands;

public record CreateServiceCommand(
    string Code,
    string Name,
    string? NameEn,
    string? Description,
    Guid? ServiceCategoryId,
    int SortOrder,
    bool IsActive) : IRequest<Guid>;

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateServiceCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiService
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Description = request.Description,
            ServiceCategoryId = request.ServiceCategoryId,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.Services.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
