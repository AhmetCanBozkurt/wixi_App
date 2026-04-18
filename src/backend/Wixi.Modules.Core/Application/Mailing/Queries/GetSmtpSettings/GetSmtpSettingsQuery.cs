using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Microsoft.Extensions.Options;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Mailing.Queries.GetSmtpSettings;

public class SmtpSettingsDto
{
    public Guid Id { get; set; }
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Be careful returning this. Might mask it or return empty if not needed by frontend. But since UI needs to edit, maybe we return it? Returning empty is safer. The user provides new pass if they want to update.
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public bool EnableSsl { get; set; }
}

public class GetSmtpSettingsQuery : IRequest<SmtpSettingsDto?>
{
}

public class GetSmtpSettingsQueryHandler : IRequestHandler<GetSmtpSettingsQuery, SmtpSettingsDto?>
{
    private readonly WixiCoreDbContext _context;
    private readonly MailOptions _mailOptions;

    public GetSmtpSettingsQueryHandler(WixiCoreDbContext context, IOptions<MailOptions> mailOptions)
    {
        _context = context;
        _mailOptions = mailOptions.Value;
    }

    public async Task<SmtpSettingsDto?> Handle(GetSmtpSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.SmtpSettings.FirstOrDefaultAsync(s => s.IsActive && !s.IsDeleted, cancellationToken);
        
        // If nothing in DB yet, fall back to appsettings MailSettings (still keep password masked)
        if (setting == null)
        {
            if (string.IsNullOrWhiteSpace(_mailOptions.Server) &&
                string.IsNullOrWhiteSpace(_mailOptions.Username) &&
                string.IsNullOrWhiteSpace(_mailOptions.SenderEmail))
            {
                return null;
            }

            return new SmtpSettingsDto
            {
                Id = Guid.Empty,
                Server = _mailOptions.Server,
                Port = _mailOptions.Port,
                Username = _mailOptions.Username,
                Password = "",
                SenderName = _mailOptions.SenderName,
                SenderEmail = _mailOptions.SenderEmail,
                EnableSsl = _mailOptions.EnableSsl
            };
        }

        return new SmtpSettingsDto
        {
            Id = setting.Id,
            Server = setting.Server,
            Port = setting.Port,
            Username = setting.Username,
            Password = "", // Do not send password to client for security
            SenderName = setting.SenderName,
            SenderEmail = setting.SenderEmail,
            EnableSsl = setting.EnableSsl
        };
    }
}
