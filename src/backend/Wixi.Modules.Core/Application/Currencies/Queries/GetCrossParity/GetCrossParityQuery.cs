using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Queries.GetCrossParity;

public record GetCrossParityQuery(string FromCode, string ToCode, DateTime? Date = null) : IRequest<CrossParityResultDto>;

public class GetCrossParityQueryHandler : IRequestHandler<GetCrossParityQuery, CrossParityResultDto>
{
    private readonly WixiCoreDbContext _context;

    public GetCrossParityQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<CrossParityResultDto> Handle(GetCrossParityQuery request, CancellationToken cancellationToken)
    {
        var fromCode = request.FromCode.ToUpperInvariant();
        var toCode = request.ToCode.ToUpperInvariant();

        var rateDate = await ResolveRateDate(request.Date, cancellationToken);

        decimal? tryPerFrom = null;
        decimal? tryPerTo = null;
        decimal rate;
        string formula;

        if (fromCode == "TRY" && toCode == "TRY")
        {
            rate = 1m;
            formula = "TRY/TRY = 1";
        }
        else if (toCode == "TRY")
        {
            tryPerFrom = await GetTryPer(fromCode, rateDate, cancellationToken);
            rate = tryPerFrom.Value;
            formula = $"Rate = ForexSelling({fromCode}) / Unit({fromCode}) = {tryPerFrom:F6} TRY";
        }
        else if (fromCode == "TRY")
        {
            tryPerTo = await GetTryPer(toCode, rateDate, cancellationToken);
            rate = tryPerTo == 0 ? 0 : 1m / tryPerTo.Value;
            formula = $"Rate = 1 / (ForexSelling({toCode}) / Unit({toCode})) = 1 / {tryPerTo:F6} = {rate:F6}";
        }
        else
        {
            tryPerFrom = await GetTryPer(fromCode, rateDate, cancellationToken);
            tryPerTo = await GetTryPer(toCode, rateDate, cancellationToken);
            rate = tryPerTo == 0 ? 0 : tryPerFrom.Value / tryPerTo.Value;
            formula = $"TRY_per_{fromCode} = {tryPerFrom:F6}" + Environment.NewLine +
                      $"TRY_per_{toCode} = {tryPerTo:F6}" + Environment.NewLine +
                      $"Rate({fromCode}/{toCode}) = {tryPerFrom:F6} / {tryPerTo:F6} = {rate:F6}";
        }

        return new CrossParityResultDto
        {
            FromCode = fromCode,
            ToCode = toCode,
            Rate = rate,
            RateDate = rateDate,
            FormulaBreakdown = formula,
            TryPerFrom = tryPerFrom,
            TryPerTo = tryPerTo
        };
    }

    private async Task<DateTime> ResolveRateDate(DateTime? requested, CancellationToken ct)
    {
        if (requested.HasValue) return requested.Value.Date;

        var latest = await _context.ExchangeRates
            .Where(r => !r.IsDeleted)
            .MaxAsync(r => (DateTime?)r.RateDate, ct);

        return latest?.Date ?? DateTime.UtcNow.Date;
    }

    private async Task<decimal> GetTryPer(string code, DateTime date, CancellationToken ct)
    {
        var rate = await _context.ExchangeRates
            .Where(r => !r.IsDeleted && r.CurrencyCode == code && r.RateDate.Date == date)
            .FirstOrDefaultAsync(ct);

        if (rate == null || !rate.ForexSelling.HasValue)
        {
            throw new InvalidOperationException($"No exchange rate found for {code} on {date:yyyy-MM-dd}.");
        }

        var unit = rate.Unit > 0 ? rate.Unit : 1;
        return rate.ForexSelling.Value / unit;
    }
}
