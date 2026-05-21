using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.HsCode.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.HsCode.Queries;

public record GetHsCodesQuery : IRequest<List<HsCodeDto>>;

public class GetHsCodesQueryHandler : IRequestHandler<GetHsCodesQuery, List<HsCodeDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetHsCodesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<HsCodeDto>> Handle(GetHsCodesQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.HsCodes
            .Where(x => !x.IsDeleted)
            .Include(x => x.Parent)
            .OrderBy(x => x.Level)
            .ThenBy(x => x.Code)
            .ToListAsync(cancellationToken);

        return items.Select(x => new HsCodeDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            Level = (int)x.Level,
            ParentId = x.ParentId,
            ParentCode = x.Parent?.Code,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
