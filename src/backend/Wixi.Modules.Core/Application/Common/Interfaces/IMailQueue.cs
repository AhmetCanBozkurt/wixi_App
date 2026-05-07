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
        _queue = Channel.CreateBounded<MailRequest>(new BoundedChannelOptions(500) { FullMode = BoundedChannelFullMode.Wait });
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
