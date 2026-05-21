using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.Service.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Service.Queries;

public record GetServicesQuery : IRequest<List<ServiceDto>>;

public class GetServicesQueryHandler : IRequestHandler<GetServicesQuery, List<ServiceDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetServicesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceDto>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Services
            .Where(x => !x.IsDeleted)
            .Include(x => x.Category)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new ServiceDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Description = x.Description,
            ServiceCategoryId = x.ServiceCategoryId,
            CategoryName = x.Category?.Name,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
