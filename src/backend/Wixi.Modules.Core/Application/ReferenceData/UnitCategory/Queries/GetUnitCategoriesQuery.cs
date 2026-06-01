using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Queries;

public record GetUnitCategoriesQuery : IRequest<List<UnitCategoryDto>>;

public class GetUnitCategoriesQueryHandler : IRequestHandler<GetUnitCategoriesQuery, List<UnitCategoryDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetUnitCategoriesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<UnitCategoryDto>> Handle(GetUnitCategoriesQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.UnitCategories
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new UnitCategoryDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
