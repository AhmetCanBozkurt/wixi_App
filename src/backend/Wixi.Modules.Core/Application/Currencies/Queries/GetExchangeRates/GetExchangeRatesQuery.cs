using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Queries.GetExchangeRates;

public record GetExchangeRatesQuery(
    DateTime? FromDate,
    DateTime? ToDate,
    string? CurrencyCode,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<ExchangeRateDto>>;

public class GetExchangeRatesQueryHandler : IRequestHandler<GetExchangeRatesQuery, PagedResult<ExchangeRateDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetExchangeRatesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ExchangeRateDto>> Handle(GetExchangeRatesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ExchangeRates.Where(r => !r.IsDeleted);

        if (request.FromDate.HasValue)
        {
            query = query.Where(r => r.RateDate.Date >= request.FromDate.Value.Date);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(r => r.RateDate.Date <= request.ToDate.Value.Date);
        }

        if (!string.IsNullOrWhiteSpace(request.CurrencyCode))
        {
            query = query.Where(r => r.CurrencyCode == request.CurrencyCode.ToUpperInvariant());
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var rates = await query
            .OrderByDescending(r => r.RateDate)
            .ThenBy(r => r.CurrencyCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ExchangeRateDto>
        {
            Items = rates.Select(r => new ExchangeRateDto
            {
                Id = r.Id,
                RateDate = r.RateDate,
                CurrencyId = r.CurrencyId,
                CurrencyCode = r.CurrencyCode,
                CrossOrder = r.CrossOrder,
                Unit = r.Unit,
                ForexBuying = r.ForexBuying,
                ForexSelling = r.ForexSelling,
                BanknoteBuying = r.BanknoteBuying,
                BanknoteSelling = r.BanknoteSelling,
                Source = r.Source,
                CreatedAt = r.CreatedAt,
                CreatedByUser = r.CreatedByUser,
                UpdatedAt = r.UpdatedAt,
                UpdatedByUser = r.UpdatedByUser
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
