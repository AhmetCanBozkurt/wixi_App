using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.PackageType.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PackageType.Queries;

public record GetPackageTypesQuery : IRequest<List<PackageTypeDto>>;

public class GetPackageTypesQueryHandler : IRequestHandler<GetPackageTypesQuery, List<PackageTypeDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetPackageTypesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<PackageTypeDto>> Handle(GetPackageTypesQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.PackageTypes
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new PackageTypeDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Symbol = x.Symbol,
            IsStackable = x.IsStackable,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
