using MediatR;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Application.Mailing.Commands.SendTestMail;

public class SendTestMailCommand : IRequest<bool>
{
    public string TemplateCode { get; set; } = string.Empty;
    public string TestEmailAddress { get; set; } = string.Empty;
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
        // For testing, we send a dummy payload that should replace most common variables like {{ fullName }} or {{ code }}
        var testData = new
        {
            fullName = "Test Kullanıcısı",
            email = request.TestEmailAddress,
            resetLink = "https://wixi.test/reset-password",
            code = "123456"
        };

        await _mailService.SendWithTemplateAsync(request.TemplateCode, request.TestEmailAddress, testData, cancellationToken);
        return true;
    }
}
