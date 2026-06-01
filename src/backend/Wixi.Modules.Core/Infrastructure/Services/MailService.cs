using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class MailService : IMailService
{
    private readonly MailOptions _mailOptions;
    private readonly IMailTemplateEngine _templateEngine;
    private readonly WixiCoreDbContext _context;

    public MailService(
        IOptions<MailOptions> mailOptions,
        IMailTemplateEngine templateEngine,
        WixiCoreDbContext context)
    {
        _mailOptions = mailOptions.Value;
        _templateEngine = templateEngine;
        _context = context;
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        // Get active SMTP Settings from DB
        var dbSettings = await _context.SmtpSettings.FirstOrDefaultAsync(s => s.IsActive && !s.IsDeleted, cancellationToken);

        string senderName = dbSettings?.SenderName ?? _mailOptions.SenderName;
        string senderEmail = dbSettings?.SenderEmail ?? _mailOptions.SenderEmail;
        string server = dbSettings?.Server ?? _mailOptions.Server;
        int port = dbSettings?.Port ?? _mailOptions.Port;
        bool enableSsl = dbSettings?.EnableSsl ?? _mailOptions.EnableSsl;
        string username = dbSettings?.Username ?? _mailOptions.Username;
        string password = dbSettings?.Password ?? _mailOptions.Password;

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(senderName, senderEmail));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = body };
        email.Body = builder.ToMessageBody();

        bool isSuccess = false;
        string? errorMessage = null;

        try
        {
            using var smtp = new SmtpClient();
            var secureOption = enableSsl ? MailKit.Security.SecureSocketOptions.Auto : MailKit.Security.SecureSocketOptions.None;
            await smtp.ConnectAsync(server, port, secureOption, cancellationToken);
            await smtp.AuthenticateAsync(username, password, cancellationToken);
            await smtp.SendAsync(email, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
            isSuccess = true;
        }
        catch (Exception ex)
        {
            errorMessage = ex.Message;
        }
        finally
        {
            // Log the attempt
            var log = new WixiMailLog
            {
                Recipient = to,
                Subject = subject,
                Body = body,
                IsSuccess = isSuccess,
                ErrorMessage = errorMessage,
                SentAt = DateTime.UtcNow
            };

            _context.MailLogs.Add(log);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task SendWithTemplateAsync(string templateCode, string to, object data, CancellationToken cancellationToken = default)
    {
        var template = await _context.MailTemplates
            .FirstOrDefaultAsync(t => t.Code == templateCode && t.IsActive && !t.IsDeleted, cancellationToken);

        if (template == null)
            throw new Exception($"Mail template not found: {templateCode}");

        var renderedSubject = _templateEngine.Render(template.Subject, data);
        var renderedBody = _templateEngine.Render(template.Body, data);

        await SendEmailAsync(to, renderedSubject, renderedBody, cancellationToken);
        
        // Update log with template code
        var lastLog = await _context.MailLogs
            .OrderByDescending(l => l.SentAt)
            .FirstOrDefaultAsync(l => l.Recipient == to && l.Subject == renderedSubject, cancellationToken);
            
        if (lastLog != null)
        {
            lastLog.TemplateCode = templateCode;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
