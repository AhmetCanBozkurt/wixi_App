using System.Threading.Channels;

namespace Wixi.Modules.Core.Application.Common.Interfaces;

public record MailRequest(string To, string Subject, string Body, string? TemplateCode = null, object? Data = null);

public interface IMailQueue
{
    ValueTask QueueEmailAsync(MailRequest request);
    ValueTask<MailRequest> DequeueEmailAsync(CancellationToken cancellationToken);
}

public class MailQueue : IMailQueue
{
    private readonly Channel<MailRequest> _queue;

    public MailQueue()
    {
        // Unbounded channel: memory bounded by app usage. 
        // For production, a Bounded channel with logic for overflow is better.
        _queue = Channel.CreateUnbounded<MailRequest>();
    }

    public async ValueTask QueueEmailAsync(MailRequest request)
    {
        await _queue.Writer.WriteAsync(request);
    }

    public async ValueTask<MailRequest> DequeueEmailAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
