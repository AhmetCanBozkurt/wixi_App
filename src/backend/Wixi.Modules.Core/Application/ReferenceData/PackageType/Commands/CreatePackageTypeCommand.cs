using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PackageType.Commands;

public record CreatePackageTypeCommand(
    string Code,
    string Name,
    string? NameEn,
    string? Symbol,
    bool IsStackable,
    int SortOrder) : IRequest<Guid>;

public class CreatePackageTypeCommandHandler : IRequestHandler<CreatePackageTypeCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreatePackageTypeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePackageTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiPackageType
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Symbol = request.Symbol,
            IsStackable = request.IsStackable,
            SortOrder = request.SortOrder
        };

        _context.PackageTypes.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
