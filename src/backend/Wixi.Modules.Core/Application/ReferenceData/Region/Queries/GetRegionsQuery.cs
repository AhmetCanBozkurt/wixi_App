using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.Region.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Region.Queries;

public record GetRegionsQuery : IRequest<List<RegionDto>>;

public class GetRegionsQueryHandler : IRequestHandler<GetRegionsQuery, List<RegionDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetRegionsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<RegionDto>> Handle(GetRegionsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Regions
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new RegionDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Description = x.Description,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
