using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.Incoterm.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Incoterm.Queries;

public record GetIncotermsQuery : IRequest<List<IncotermDto>>;

public class GetIncotermsQueryHandler : IRequestHandler<GetIncotermsQuery, List<IncotermDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetIncotermsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<IncotermDto>> Handle(GetIncotermsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Incoterms
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new IncotermDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Description = x.Description,
            DescriptionEn = x.DescriptionEn,
            Group = x.Group,
            SellerPaysFreight = x.SellerPaysFreight,
            SellerPaysInsurance = x.SellerPaysInsurance,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
