using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.Port.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Port.Queries;

public record GetPortsQuery : IRequest<List<PortDto>>;

public class GetPortsQueryHandler : IRequestHandler<GetPortsQuery, List<PortDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetPortsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<PortDto>> Handle(GetPortsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Ports
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new PortDto
        {
            Id = x.Id,
            UnLocode = x.UnLocode,
            Name = x.Name,
            NameEn = x.NameEn,
            CountryCode = x.CountryCode,
            CityName = x.CityName,
            Type = x.Type,
            IsTurkish = x.IsTurkish,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
