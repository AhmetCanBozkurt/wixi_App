using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Queries;

public record GetServiceCategoriesQuery : IRequest<List<ServiceCategoryDto>>;

public class GetServiceCategoriesQueryHandler : IRequestHandler<GetServiceCategoriesQuery, List<ServiceCategoryDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetServiceCategoriesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceCategoryDto>> Handle(GetServiceCategoriesQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.ServiceCategories
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new ServiceCategoryDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Description = x.Description,
            ColorHex = x.ColorHex,
            Icon = x.Icon,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
