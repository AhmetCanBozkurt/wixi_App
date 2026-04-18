using MediatR;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Application.Mailing.Commands.SendTestMail;

public class SendTestMailCommand : IRequest<bool>
{
    public string TemplateCode { get; set; } = string.Empty;
    public string TestEmailAddress { get; set; } = string.Empty;
    public Dictionary<string, string>? Variables { get; set; }
}

public class SendTestMailCommandHandler : IRequestHandler<SendTestMailCommand, bool>
{
    private readonly IMailService _mailService;

    public SendTestMailCommandHandler(IMailService mailService)
    {
        _mailService = mailService;
    }

    public async Task<bool> Handle(SendTestMailCommand request, CancellationToken cancellationToken)
    {
        // For testing, we still provide sane defaults, but allow UI-supplied variables to override.
        var data = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase)
        {
            ["fullName"] = "Test Kullanıcısı",
            ["email"] = request.TestEmailAddress,
            ["resetLink"] = "https://wixi.test/reset-password",
            ["code"] = "123456"
        };

        if (request.Variables != null)
        {
            foreach (var kv in request.Variables)
            {
                if (string.IsNullOrWhiteSpace(kv.Key)) continue;
                data[kv.Key.Trim()] = kv.Value ?? string.Empty;
            }
        }

        await _mailService.SendWithTemplateAsync(request.TemplateCode, request.TestEmailAddress, data, cancellationToken);
        return true;
    }
}
