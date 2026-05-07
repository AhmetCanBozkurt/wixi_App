using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Queries.GetLatestRates;

public record GetLatestRatesQuery(DateTime? Date = null) : IRequest<List<ExchangeRateDto>>;

public class GetLatestRatesQueryHandler : IRequestHandler<GetLatestRatesQuery, List<ExchangeRateDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetLatestRatesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExchangeRateDto>> Handle(GetLatestRatesQuery request, CancellationToken cancellationToken)
    {
        DateTime targetDate;

        if (request.Date.HasValue)
        {
            targetDate = request.Date.Value.Date;
        }
        else
        {
            var latestDate = await _context.ExchangeRates
                .Where(r => !r.IsDeleted)
                .MaxAsync(r => (DateTime?)r.RateDate, cancellationToken);

            if (!latestDate.HasValue)
            {
                return new List<ExchangeRateDto>();
            }

            targetDate = latestDate.Value.Date;
        }

        var rates = await _context.ExchangeRates
            .Where(r => !r.IsDeleted && r.RateDate.Date == targetDate)
            .OrderBy(r => r.CurrencyCode)
            .ToListAsync(cancellationToken);

        return rates.Select(r => new ExchangeRateDto
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
        }).ToList();
    }
}
