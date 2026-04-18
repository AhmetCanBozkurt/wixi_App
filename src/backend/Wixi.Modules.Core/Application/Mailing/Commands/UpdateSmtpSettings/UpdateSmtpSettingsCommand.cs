using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Mailing.Commands.UpdateSmtpSettings;

public class UpdateSmtpSettingsCommand : IRequest<bool>
{
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public bool EnableSsl { get; set; }
}

public class UpdateSmtpSettingsCommandHandler : IRequestHandler<UpdateSmtpSettingsCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateSmtpSettingsCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateSmtpSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.SmtpSettings.FirstOrDefaultAsync(s => s.IsActive && !s.IsDeleted, cancellationToken);

        if (setting == null)
        {
            setting = new WixiSmtpSetting
            {
                IsActive = true
            };
            await _context.SmtpSettings.AddAsync(setting, cancellationToken);
        }

        setting.Server = request.Server;
        setting.Port = request.Port;
        setting.Username = request.Username;
        if (!string.IsNullOrEmpty(request.Password)) // Update password only if provided
        {
            setting.Password = request.Password;
        }
        setting.SenderName = request.SenderName;
        setting.SenderEmail = request.SenderEmail;
        setting.EnableSsl = request.EnableSsl;

        await _context.SaveChangesAsync(cancellationToken);
        
        // Log setup update using IAuditable logic
        await _context.LogActivityAsync("SMTP_UPDATED", "WIXI_SMTP_SETTINGS", setting.Id.ToString(), "SMTP Settings successfully updated by the user.");
        
        return true;
    }
}
