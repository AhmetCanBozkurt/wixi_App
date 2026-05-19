using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Commands.SyncTcmbRates;

public record SyncTcmbRatesCommand(DateTime? Date) : IRequest<TcmbSyncResultDto>;

public class SyncTcmbRatesCommandHandler : IRequestHandler<SyncTcmbRatesCommand, TcmbSyncResultDto>
{
    private readonly WixiCoreDbContext _context;
    private readonly ITcmbExchangeRateService _tcmbService;
    private readonly ILogger<SyncTcmbRatesCommandHandler> _logger;

    public SyncTcmbRatesCommandHandler(
        WixiCoreDbContext context,
        ITcmbExchangeRateService tcmbService,
        ILogger<SyncTcmbRatesCommandHandler> logger)
    {
        _context = context;
        _tcmbService = tcmbService;
        _logger = logger;
    }

    public async Task<TcmbSyncResultDto> Handle(SyncTcmbRatesCommand request, CancellationToken cancellationToken)
    {
        var targetDate = request.Date?.Date ?? DateTime.UtcNow.Date;

        TcmbDailyRatesDto fetchResult;
        try
        {
            fetchResult = await _tcmbService.FetchAsync(targetDate, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TCMB fetch failed for date {Date}", targetDate);
            await UpdateSyncStatus($"Error: {ex.Message}", cancellationToken);
            return new TcmbSyncResultDto
            {
                Status = "Error",
                Date = targetDate,
                RatesSaved = 0,
                ErrorMessage = ex.Message
            };
        }

        if (fetchResult.Status != "Success")
        {
            await UpdateSyncStatus(fetchResult.Status, cancellationToken);
            return new TcmbSyncResultDto
            {
                Status = fetchResult.Status,
                Date = targetDate,
                RatesSaved = 0
            };
        }

        // Auto-create any TCMB currencies that are not yet in the database
        var existingCodes = await _context.Currencies
            .Where(c => !c.IsDeleted)
            .Select(c => c.Code)
            .ToListAsync(cancellationToken);

        var existingCodeSet = new HashSet<string>(existingCodes, StringComparer.OrdinalIgnoreCase);
        var newCurrencies = new List<WixiCurrency>();
        int sortOrder = existingCodes.Count + 10;

        foreach (var rate in fetchResult.Rates)
        {
            var code = (rate.CurrencyCode ?? rate.Kod ?? "").Trim().ToUpperInvariant();
            if (string.IsNullOrEmpty(code) || existingCodeSet.Contains(code)) continue;

            newCurrencies.Add(new WixiCurrency
            {
                Code = code,
                Name = string.IsNullOrWhiteSpace(rate.Isim) ? code : rate.Isim,
                NameEn = string.IsNullOrWhiteSpace(rate.CurrencyName) ? string.Empty : rate.CurrencyName,
                Unit = rate.Unit > 0 ? rate.Unit : 1,
                IsBase = false,
                IsTcmbTracked = true,
                IsActive = true,
                SortOrder = sortOrder++
            });
            existingCodeSet.Add(code);
        }

        if (newCurrencies.Count > 0)
        {
            await _context.Currencies.AddRangeAsync(newCurrencies, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Auto-created {Count} currencies from TCMB data: {Codes}",
                newCurrencies.Count, string.Join(", ", newCurrencies.Select(c => c.Code)));
        }

        var currencies = await _context.Currencies
            .Where(c => !c.IsDeleted && c.IsTcmbTracked)
            .ToListAsync(cancellationToken);

        var currencyCodeMap = currencies.ToDictionary(c => c.Code, c => c);

        // FIX-3: Pre-fetch all rates for targetDate in one query to avoid N+1
        var currencyIds = currencies.Select(c => c.Id).ToList();
        var existingRatesForDate = await _context.ExchangeRates
            .Where(r => r.RateDate.Date == targetDate && currencyIds.Contains(r.CurrencyId))
            .ToListAsync(cancellationToken);
        var existingRateMap = existingRatesForDate.ToDictionary(r => r.CurrencyId);

        int saved = 0;

        foreach (var rate in fetchResult.Rates)
        {
            if (!currencyCodeMap.TryGetValue(rate.CurrencyCode, out var currency))
            {
                continue;
            }

            existingRateMap.TryGetValue(currency.Id, out var existing);

            if (existing != null)
            {
                existing.ForexBuying = rate.ForexBuying;
                existing.ForexSelling = rate.ForexSelling;
                existing.BanknoteBuying = rate.BanknoteBuying;
                existing.BanknoteSelling = rate.BanknoteSelling;
                existing.Unit = rate.Unit;
                existing.CrossOrder = rate.CrossOrder;
                existing.Source = "TCMB";
            }
            else
            {
                var newRate = new WixiExchangeRate
                {
                    RateDate = targetDate,
                    CurrencyId = currency.Id,
                    CurrencyCode = rate.CurrencyCode,
                    Unit = rate.Unit,
                    CrossOrder = rate.CrossOrder,
                    ForexBuying = rate.ForexBuying,
                    ForexSelling = rate.ForexSelling,
                    BanknoteBuying = rate.BanknoteBuying,
                    BanknoteSelling = rate.BanknoteSelling,
                    Source = "TCMB"
                };
                _context.ExchangeRates.Add(newRate);
            }

            saved++;
        }

        await _context.SaveChangesAsync(cancellationToken);
        await UpdateSyncStatus("Success", cancellationToken);

        _logger.LogInformation("TCMB sync completed for {Date}. Saved {Count} rates, created {New} new currencies.",
            targetDate, saved, newCurrencies.Count);

        return new TcmbSyncResultDto
        {
            Status = "Success",
            Date = targetDate,
            RatesSaved = saved,
            CurrenciesCreated = newCurrencies.Count
        };
    }

    private async Task UpdateSyncStatus(string status, CancellationToken cancellationToken)
    {
        var setting = await _context.CurrencySettings.FirstOrDefaultAsync(cancellationToken);
        if (setting != null)
        {
            setting.LastSyncedAt = DateTime.UtcNow;
            // FIX-7: Truncate to prevent DbUpdateException (column MaxLength=500)
            setting.LastSyncStatus = status.Length > 497 ? status[..497] + "..." : status;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
