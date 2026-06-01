using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Contact.Commands;

public record SubmitContactFormCommand(
    string Name,
    string Email,
    string Subject,
    string Message
) : IRequest<Unit>;

public class SubmitContactFormCommandHandler : IRequestHandler<SubmitContactFormCommand, Unit>
{
    private readonly ECommerceDbContext _db;
    private readonly IMailQueue _mailQueue;

    public SubmitContactFormCommandHandler(ECommerceDbContext db, IMailQueue mailQueue)
    {
        _db = db;
        _mailQueue = mailQueue;
    }

    public async Task<Unit> Handle(SubmitContactFormCommand request, CancellationToken ct)
    {
        var settings = await _db.StoreSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        var adminEmail = settings?.ContactEmail ?? "info@wixi.app";

        var body = $@"
<h3>Yeni İletişim Formu Mesajı</h3>
<p><strong>Gönderen:</strong> {request.Name} ({request.Email})</p>
<p><strong>Konu:</strong> {request.Subject}</p>
<hr />
<p>{request.Message}</p>
";

        await _mailQueue.QueueEmailAsync(new MailRequest(
            To: adminEmail,
            Subject: $"[İletişim Formu] {request.Subject}",
            Body: body
        ));

        return Unit.Value;
    }
}
