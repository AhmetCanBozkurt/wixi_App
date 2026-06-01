using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Queries;

public record GetTaxOfficesQuery : IRequest<List<TaxOfficeDto>>;

public class GetTaxOfficesQueryHandler : IRequestHandler<GetTaxOfficesQuery, List<TaxOfficeDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetTaxOfficesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaxOfficeDto>> Handle(GetTaxOfficesQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.TaxOffices
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new TaxOfficeDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            CityName = x.CityName,
            CountryCode = x.CountryCode,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
