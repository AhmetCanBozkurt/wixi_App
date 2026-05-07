using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Queries.GetParity;

public record GetParityQuery(string FromCode, string ToCode, DateTime? Date = null) : IRequest<ParityResultDto>;

public class GetParityQueryHandler : IRequestHandler<GetParityQuery, ParityResultDto>
{
    private readonly WixiCoreDbContext _context;

    public GetParityQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<ParityResultDto> Handle(GetParityQuery request, CancellationToken cancellationToken)
    {
        var fromCode = request.FromCode.ToUpperInvariant();
        var toCode = request.ToCode.ToUpperInvariant();

        var rateDate = await ResolveRateDate(request.Date, cancellationToken);

        decimal rate;
        string description;

        if (fromCode == "TRY" && toCode == "TRY")
        {
            rate = 1m;
            description = "TRY/TRY = 1";
        }
        else if (toCode == "TRY")
        {
            var fromRate = await GetRateForDate(fromCode, rateDate, cancellationToken);
            rate = fromRate.tryPer;
            description = $"1 {fromCode} = {rate:F6} TRY (ForexSelling / Unit)";
        }
        else if (fromCode == "TRY")
        {
            var toRate = await GetRateForDate(toCode, rateDate, cancellationToken);
            rate = toRate.tryPer == 0 ? 0 : 1m / toRate.tryPer;
            description = $"1 TRY = {rate:F6} {toCode} (1 / TRY_per_{toCode})";
        }
        else
        {
            var fromRate = await GetRateForDate(fromCode, rateDate, cancellationToken);
            var toRate = await GetRateForDate(toCode, rateDate, cancellationToken);
            rate = toRate.tryPer == 0 ? 0 : fromRate.tryPer / toRate.tryPer;
            description = $"1 {fromCode} = {rate:F6} {toCode} (TRY_per_{fromCode} / TRY_per_{toCode})";
        }

        return new ParityResultDto
        {
            FromCode = fromCode,
            ToCode = toCode,
            Rate = rate,
            RateDate = rateDate,
            Description = description
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

    private async Task<(decimal tryPer, int unit)> GetRateForDate(string code, DateTime date, CancellationToken ct)
    {
        var rate = await _context.ExchangeRates
            .Where(r => !r.IsDeleted && r.CurrencyCode == code && r.RateDate.Date == date)
            .FirstOrDefaultAsync(ct);

        if (rate == null || !rate.ForexSelling.HasValue)
        {
            throw new InvalidOperationException($"No exchange rate found for {code} on {date:yyyy-MM-dd}.");
        }

        var unit = rate.Unit > 0 ? rate.Unit : 1;
        return (rate.ForexSelling.Value / unit, unit);
    }
}
