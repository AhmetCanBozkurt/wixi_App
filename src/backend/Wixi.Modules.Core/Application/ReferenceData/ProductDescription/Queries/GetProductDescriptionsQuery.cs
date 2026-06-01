using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Queries;

public record GetProductDescriptionsQuery : IRequest<List<ProductDescriptionDto>>;

public class GetProductDescriptionsQueryHandler : IRequestHandler<GetProductDescriptionsQuery, List<ProductDescriptionDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetProductDescriptionsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDescriptionDto>> Handle(GetProductDescriptionsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.ProductDescriptions
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new ProductDescriptionDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            HsCode = x.HsCode,
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
