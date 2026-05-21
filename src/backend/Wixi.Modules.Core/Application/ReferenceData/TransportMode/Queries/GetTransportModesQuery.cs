using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.TransportMode.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TransportMode.Queries;

public record GetTransportModesQuery : IRequest<List<TransportModeDto>>;

public class GetTransportModesQueryHandler : IRequestHandler<GetTransportModesQuery, List<TransportModeDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetTransportModesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<TransportModeDto>> Handle(GetTransportModesQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.TransportModes
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new TransportModeDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Icon = x.Icon,
            ColorHex = x.ColorHex,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
