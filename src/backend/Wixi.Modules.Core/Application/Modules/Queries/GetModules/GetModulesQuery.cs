using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Queries.GetModules;

public record GetModulesQuery : IRequest<List<ModuleDto>>
{
    public bool PublicOnly { get; init; } = false;
}

public record ModuleDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string? Icon,
    bool IsPublic,
    bool IsActive,
    decimal? PriceMonthly,
    decimal? PriceYearly,
    string? FeaturesJson,
    string? ColorAccent,
    bool IsPopular,
    int SortOrder,
    string? Category,
    string? Tag
);

public class GetModulesQueryHandler : IRequestHandler<GetModulesQuery, List<ModuleDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetModulesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<ModuleDto>> Handle(GetModulesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Modules
            .Where(m => !m.IsDeleted);

        if (request.PublicOnly)
        {
            query = query.Where(m => m.IsPublic && m.IsActive);
        }

        return await query
            .OrderBy(m => m.SortOrder)
            .ThenBy(m => m.Name)
            .Select(m => new ModuleDto(
                m.Id,
                m.Code,
                m.Name,
                m.Description,
                m.Icon,
                m.IsPublic,
                m.IsActive,
                m.PriceMonthly,
                m.PriceYearly,
                m.FeaturesJson,
                m.ColorAccent,
                m.IsPopular,
                m.SortOrder,
                m.Category,
                m.Tag
            ))
            .ToListAsync(cancellationToken);
    }
}
