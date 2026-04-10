using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Email.Entities;
using wixi.Email.DTOs;
using wixi.Email.Interfaces;

namespace wixi.WebAPI.Services
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly WixiDbContext _context;
        private readonly ISmtpSettingsService _settingsService;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(WixiDbContext context, ISmtpSettingsService settingsService, ILogger<SmtpEmailSender> logger)
        {
            _context = context;
            _settingsService = settingsService;
            _logger = logger;
        }

        public async Task SendAsync(EmailMessage message)
        {
            var settings = await _settingsService.GetAsync();
            if (settings == null) throw new InvalidOperationException("SMTP settings not configured");

            var retries = settings.RetryCount <= 0 ? 1 : settings.RetryCount;
            var attempt = 0;
            Exception? last = null;
            
            do
            {
                attempt++;
                var log = new EmailLog
                {
                    CorrelationId = !string.IsNullOrEmpty(message.CorrelationId) && Guid.TryParse(message.CorrelationId, out var guid) ? guid : null,
                    MetadataJson = message.Metadata != null ? System.Text.Json.JsonSerializer.Serialize(message.Metadata) : null,
                    FromEmail = string.IsNullOrEmpty(message.FromEmail) ? settings.FromEmail : message.FromEmail,
                    FromName = string.IsNullOrEmpty(message.FromName) ? settings.FromName : message.FromName,
                    ToEmails = string.Join(',', message.To ?? Enumerable.Empty<string>()),
                    CcEmails = message.Cc != null ? string.Join(',', message.Cc) : null,
                    BccEmails = message.Bcc != null ? string.Join(',', message.Bcc) : null,
                    Subject = message.Subject,
                    BodyHtml = message.BodyHtml,
                    BodyText = message.BodyText,
                    TemplateKey = message.TemplateKey, // Store template key for tracking
                    Status = EmailStatus.Queued,
                    AttemptCount = attempt,
                    SmtpHost = settings.Host,
                    SmtpPort = settings.Port,
                    UsedSsl = settings.UseSsl,
                    UsedUserName = settings.UserName,
                };
                _context.EmailLogs.Add(log);
                await _context.SaveChangesAsync();

                try
                {
                    string password = settings.PasswordEnc ?? string.Empty;
                    
                    using var smtp = new SmtpClient(settings.Host, settings.Port)
                    {
                        EnableSsl = settings.UseSsl,
                        Credentials = new NetworkCredential(settings.UserName, password)
                    };

                    var fromEmail = string.IsNullOrEmpty(message.FromEmail) ? settings.FromEmail : message.FromEmail;
                    var fromName = string.IsNullOrEmpty(message.FromName) ? settings.FromName : message.FromName;
                    
                    using var mail = new MailMessage
                    {
                        From = new MailAddress(fromEmail, fromName),
                        Subject = message.Subject,
                        Body = !string.IsNullOrEmpty(message.BodyHtml) ? message.BodyHtml : message.BodyText,
                        IsBodyHtml = !string.IsNullOrEmpty(message.BodyHtml)
                    };
                    
                    if (message.To != null && message.To.Count > 0)
                    {
                        foreach (var t in message.To) mail.To.Add(t);
                    }
                    if (message.Cc != null && message.Cc.Count > 0)
                    {
                        foreach (var c in message.Cc) mail.CC.Add(c);
                    }
                    if (message.Bcc != null && message.Bcc.Count > 0)
                    {
                        foreach (var b in message.Bcc) mail.Bcc.Add(b);
                    }

                    // Add attachments if any
                    if (message.Attachments != null && message.Attachments.Any())
                    {
                        foreach (var attachment in message.Attachments)
                        {
                            try
                            {
                                if (System.IO.File.Exists(attachment.FilePath))
                                {
                                    var mailAttachment = new System.Net.Mail.Attachment(attachment.FilePath);
                                    mailAttachment.Name = attachment.FileName;
                                    if (!string.IsNullOrEmpty(attachment.ContentType))
                                    {
                                        mailAttachment.ContentType = new System.Net.Mime.ContentType(attachment.ContentType);
                                    }
                                    mail.Attachments.Add(mailAttachment);
                                    _logger.LogInformation("Added attachment to email: {FileName}", attachment.FileName);
                                }
                                else
                                {
                                    _logger.LogWarning("Attachment file not found: {FilePath}", attachment.FilePath);
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Error adding attachment {FileName}: {Error}", attachment.FileName, ex.Message);
                            }
                        }
                    }

                    await smtp.SendMailAsync(mail);

                    log.Status = EmailStatus.Sent;
                    log.LastAttemptAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Email sent successfully to {To}", message.To != null ? string.Join(',', message.To) : "unknown");
                    return;
                }
                catch (Exception ex)
                {
                    log.Status = EmailStatus.Failed;
                    log.LastAttemptAt = DateTime.UtcNow;
                    log.LastError = ex.Message.Length > 4000 ? ex.Message.Substring(0, 4000) : ex.Message;
                    await _context.SaveChangesAsync();
                    _logger.LogError(ex, "Email send failed on attempt {Attempt}", attempt);
                    last = ex;
                }
                
                if (attempt < retries)
                {
                    await Task.Delay(TimeSpan.FromSeconds(Math.Min(30, attempt * 2)));
                }
            } while (attempt < retries);
            
            if (last != null) throw last;
        }
    }
}

