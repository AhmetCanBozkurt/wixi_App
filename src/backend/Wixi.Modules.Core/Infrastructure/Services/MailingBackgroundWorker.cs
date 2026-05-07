using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class MailingBackgroundWorker : BackgroundService
{
    private const int MaxRetries = 3;
    private static readonly TimeSpan[] RetryDelays = [TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(45)];

    private readonly IMailQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MailingBackgroundWorker> _logger;

    public MailingBackgroundWorker(
        IMailQueue queue,
        IServiceProvider serviceProvider,
        ILogger<MailingBackgroundWorker> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Mailing Background Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            MailRequest? request = null;
            try
            {
                request = await _queue.DequeueEmailAsync(stoppingToken);
                await SendWithRetryAsync(request, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Mail permanently failed for {Recipient} after {MaxRetries} attempts.", request?.To, MaxRetries);
            }
        }

        _logger.LogInformation("Mailing Background Worker is stopping.");
    }

    private async Task SendWithRetryAsync(MailRequest request, CancellationToken ct)
    {
        for (int attempt = 1; attempt <= MaxRetries; attempt++)
        {
            try
            {
                _logger.LogInformation("Sending mail to {Recipient} (attempt {Attempt}/{Max}).", request.To, attempt, MaxRetries);

                using var scope = _serviceProvider.CreateScope();
                var mailService = scope.ServiceProvider.GetRequiredService<IMailService>();

                if (!string.IsNullOrEmpty(request.TemplateCode) && request.Data != null)
                    await mailService.SendWithTemplateAsync(request.TemplateCode, request.To, request.Data, ct);
                else
                    await mailService.SendEmailAsync(request.To, request.Subject, request.Body, ct);

                return;
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex) when (attempt < MaxRetries)
            {
                var delay = RetryDelays[attempt - 1];
                _logger.LogWarning(ex, "Mail to {Recipient} failed on attempt {Attempt}. Retrying in {Delay}s.", request.To, attempt, delay.TotalSeconds);
                await Task.Delay(delay, ct);
            }
        }
    }
}
