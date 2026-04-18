using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

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

    public GetSmtpSettingsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<SmtpSettingsDto?> Handle(GetSmtpSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.SmtpSettings.FirstOrDefaultAsync(s => s.IsActive && !s.IsDeleted, cancellationToken);
        
        if (setting == null) return null;

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
