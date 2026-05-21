using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Region.Commands;

public record CreateRegionCommand(
    string Code,
    string Name,
    string? NameEn,
    string? Description,
    int SortOrder) : IRequest<Guid>;

public class CreateRegionCommandHandler : IRequestHandler<CreateRegionCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateRegionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateRegionCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiRegion
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Description = request.Description,
            SortOrder = request.SortOrder
        };

        _context.Regions.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
