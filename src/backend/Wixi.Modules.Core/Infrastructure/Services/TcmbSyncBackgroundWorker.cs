using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Wixi.Modules.Core.Application.Currencies.Commands.SyncTcmbRates;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class TcmbSyncBackgroundWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TcmbSyncBackgroundWorker> _logger;

    public TcmbSyncBackgroundWorker(IServiceProvider serviceProvider, ILogger<TcmbSyncBackgroundWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TCMB Sync Background Worker starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await WaitUntilNextHour(stoppingToken);

            if (stoppingToken.IsCancellationRequested) break;

            // FIX-5: Use Turkey timezone — TCMB publishes at ~15:30 TR time (UTC+3)
            var turkeyZone = TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
            var nowTurkey = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, turkeyZone);

            // Skip weekends — TCMB does not publish on Saturday/Sunday
            if (nowTurkey.DayOfWeek == DayOfWeek.Saturday || nowTurkey.DayOfWeek == DayOfWeek.Sunday)
            {
                _logger.LogInformation("TCMB Sync skipped — weekend ({Day})", nowTurkey.DayOfWeek);
                continue;
            }

            // Only sync at 16:00 Turkey time (gives TCMB ~30 min after publication)
            if (nowTurkey.Hour != 16)
            {
                continue;
            }

            if (!await IsSyncNeededAsync(stoppingToken))
            {
                _logger.LogInformation("TCMB Sync skipped — already synced today.");
                continue;
            }

            await RunSyncAsync(stoppingToken);
        }

        _logger.LogInformation("TCMB Sync Background Worker stopping.");
    }

    private async Task WaitUntilNextHour(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var nextHour = now.Date.AddHours(now.Hour + 1);
        var delay = nextHour - now;

        if (delay > TimeSpan.Zero)
        {
            try
            {
                await Task.Delay(delay, ct).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                // Expected during host shutdown — let the while-loop condition exit cleanly
            }
        }
    }

    private async Task<bool> IsSyncNeededAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<WixiCoreDbContext>();
        var setting = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .FirstOrDefaultAsync(context.CurrencySettings, ct);

        if (setting == null) return true;
        if (!setting.TcmbAutoSyncEnabled) return false;

        return setting.LastSyncedAt?.Date != DateTime.UtcNow.Date;
    }

    private async Task RunSyncAsync(CancellationToken ct)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
            var result = await mediator.Send(new SyncTcmbRatesCommand(null), ct);
            _logger.LogInformation("TCMB auto-sync completed. Status={Status}, RatesSaved={Count}", result.Status, result.RatesSaved);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TCMB background sync failed.");
        }
    }
}
