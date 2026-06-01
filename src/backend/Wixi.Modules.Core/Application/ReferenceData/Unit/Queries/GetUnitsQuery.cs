using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.Unit.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Unit.Queries;

public record GetUnitsQuery : IRequest<List<UnitDto>>;

public class GetUnitsQueryHandler : IRequestHandler<GetUnitsQuery, List<UnitDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetUnitsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<UnitDto>> Handle(GetUnitsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Units
            .Where(x => !x.IsDeleted)
            .Include(x => x.Category)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new UnitDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Symbol = x.Symbol,
            UnitCategoryId = x.UnitCategoryId,
            CategoryName = x.Category?.Name,
            IsBaseUnit = x.IsBaseUnit,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
