using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Queries.ConvertAmount;

public record ConvertAmountQuery(
    decimal Amount,
    string FromCode,
    string ToCode,
    DateTime? Date = null,
    string RateField = "ForexSelling"
) : IRequest<ConversionResultDto>;

public class ConvertAmountQueryHandler : IRequestHandler<ConvertAmountQuery, ConversionResultDto>
{
    private readonly WixiCoreDbContext _context;

    public ConvertAmountQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<ConversionResultDto> Handle(ConvertAmountQuery request, CancellationToken cancellationToken)
    {
        var fromCode = request.FromCode.ToUpperInvariant();
        var toCode = request.ToCode.ToUpperInvariant();
        var rateField = request.RateField ?? "ForexSelling";

        var rateDate = await ResolveRateDate(request.Date, cancellationToken);

        decimal rate;

        if (fromCode == toCode)
        {
            rate = 1m;
        }
        else if (toCode == "TRY")
        {
            rate = await GetFieldValue(fromCode, rateDate, rateField, cancellationToken);
        }
        else if (fromCode == "TRY")
        {
            var toFieldValue = await GetFieldValue(toCode, rateDate, rateField, cancellationToken);
            rate = toFieldValue == 0 ? 0 : 1m / toFieldValue;
        }
        else
        {
            var fromTry = await GetFieldValue(fromCode, rateDate, rateField, cancellationToken);
            var toTry = await GetFieldValue(toCode, rateDate, rateField, cancellationToken);
            rate = toTry == 0 ? 0 : fromTry / toTry;
        }

        return new ConversionResultDto
        {
            Amount = request.Amount,
            FromCode = fromCode,
            ToCode = toCode,
            Rate = rate,
            ConvertedAmount = request.Amount * rate,
            RateDate = rateDate,
            RateField = rateField
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

    private async Task<decimal> GetFieldValue(string code, DateTime date, string field, CancellationToken ct)
    {
        var rate = await _context.ExchangeRates
            .Where(r => !r.IsDeleted && r.CurrencyCode == code && r.RateDate.Date == date)
            .FirstOrDefaultAsync(ct);

        if (rate == null)
        {
            throw new InvalidOperationException($"No exchange rate found for {code} on {date:yyyy-MM-dd}.");
        }

        var unit = rate.Unit > 0 ? rate.Unit : 1;

        decimal? raw = field.ToLowerInvariant() switch
        {
            "forexbuying" => rate.ForexBuying,
            "forexselling" => rate.ForexSelling,
            "banknotebuying" => rate.BanknoteBuying,
            "banknoteselling" => rate.BanknoteSelling,
            _ => rate.ForexSelling
        };

        if (!raw.HasValue)
        {
            throw new InvalidOperationException($"Rate field '{field}' is null for {code} on {date:yyyy-MM-dd}.");
        }

        return raw.Value / unit;
    }
}
