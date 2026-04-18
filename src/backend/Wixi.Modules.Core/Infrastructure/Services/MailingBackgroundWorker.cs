using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class MailingBackgroundWorker : BackgroundService
{
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
            try
            {
                // Dequeue next mail request
                var request = await _queue.DequeueEmailAsync(stoppingToken);

                _logger.LogInformation("Processing mail for {Recipient}", request.To);

                // Create a scope to resolve scoped services (DbContext, MailService)
                using var scope = _serviceProvider.CreateScope();
                var mailService = scope.ServiceProvider.GetRequiredService<IMailService>();

                if (!string.IsNullOrEmpty(request.TemplateCode) && request.Data != null)
                {
                    await mailService.SendWithTemplateAsync(request.TemplateCode, request.To, request.Data, stoppingToken);
                }
                else
                {
                    await mailService.SendEmailAsync(request.To, request.Subject, request.Body, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing mailing task.");
                // Burada bir retry mekanizması veya "Dead Letter Queue" eklenebilir.
            }
        }

        _logger.LogInformation("Mailing Background Worker is stopping.");
    }
}
