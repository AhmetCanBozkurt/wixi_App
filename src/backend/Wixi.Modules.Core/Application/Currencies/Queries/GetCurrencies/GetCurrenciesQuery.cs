using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Queries.GetCurrencies;

public record GetCurrenciesQuery(bool ActiveOnly = false) : IRequest<List<CurrencyDto>>;

public class GetCurrenciesQueryHandler : IRequestHandler<GetCurrenciesQuery, List<CurrencyDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetCurrenciesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<CurrencyDto>> Handle(GetCurrenciesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Currencies.Where(c => !c.IsDeleted);

        if (request.ActiveOnly)
        {
            query = query.Where(c => c.IsActive);
        }

        var currencies = await query
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);

        return currencies.Select(c => new CurrencyDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            NameEn = c.NameEn,
            Symbol = c.Symbol,
            Unit = c.Unit,
            IsBase = c.IsBase,
            IsTcmbTracked = c.IsTcmbTracked,
            SortOrder = c.SortOrder,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt,
            CreatedByUser = c.CreatedByUser,
            UpdatedAt = c.UpdatedAt,
            UpdatedByUser = c.UpdatedByUser
        }).ToList();
    }
}
