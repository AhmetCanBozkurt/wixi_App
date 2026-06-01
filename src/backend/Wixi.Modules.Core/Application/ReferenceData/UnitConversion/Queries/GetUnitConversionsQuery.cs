using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Queries;

public record GetUnitConversionsQuery : IRequest<List<UnitConversionDto>>;

public class GetUnitConversionsQueryHandler : IRequestHandler<GetUnitConversionsQuery, List<UnitConversionDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetUnitConversionsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<UnitConversionDto>> Handle(GetUnitConversionsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.UnitConversions
            .Where(x => !x.IsDeleted)
            .Include(x => x.FromUnit)
            .Include(x => x.ToUnit)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        return items.Select(x => new UnitConversionDto
        {
            Id = x.Id,
            FromUnitId = x.FromUnitId,
            FromUnitName = x.FromUnit?.Name,
            FromUnitSymbol = x.FromUnit?.Symbol,
            ToUnitId = x.ToUnitId,
            ToUnitName = x.ToUnit?.Name,
            ToUnitSymbol = x.ToUnit?.Symbol,
            Factor = x.Factor,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
