using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class SubscriptionExpiryBackgroundWorker : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<SubscriptionExpiryBackgroundWorker> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    public SubscriptionExpiryBackgroundWorker(IServiceProvider services, ILogger<SubscriptionExpiryBackgroundWorker> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckExpiredSubscriptionsAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task CheckExpiredSubscriptionsAsync(CancellationToken ct)
    {
        try
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<WixiCoreDbContext>();
            var mailService = scope.ServiceProvider.GetRequiredService<IMailService>();

            var now = DateTime.UtcNow;
            var expired = await db.TenantSubscriptions
                .Include(s => s.Tenant)
                .Where(s => s.Status == "Active"
                    && s.CurrentPeriodEnd < now
                    && string.IsNullOrEmpty(s.StripeSubscriptionId))
                .ToListAsync(ct);

            foreach (var sub in expired)
            {
                sub.Status = "PastDue";
                sub.UpdatedAt = now;

                try
                {
                    await mailService.SendWithTemplateAsync(
                        "SUBSCRIPTION_EXPIRED",
                        sub.Tenant.OwnerEmail,
                        new { tenantName = sub.Tenant.Name },
                        ct);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Subscription expiry email failed for tenant {TenantId}.", sub.TenantId);
                }
            }

            if (expired.Count > 0)
            {
                await db.SaveChangesAsync(ct);
                _logger.LogInformation("Marked {Count} subscriptions as PastDue.", expired.Count);
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Subscription expiry check failed.");
        }
    }
}
