using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Email.DTOs;
using wixi.Email.Entities;
using wixi.Email.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/email")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminEmailController : ControllerBase
{
    private readonly ISmtpSettingsService _settingsService;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _templateService;
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminEmailController> _logger;

    public AdminEmailController(
        ISmtpSettingsService settingsService,
        IEmailSender emailSender,
        IEmailTemplateService templateService,
        WixiDbContext context,
        ILogger<AdminEmailController> logger)
    {
        _settingsService = settingsService;
        _emailSender = emailSender;
        _templateService = templateService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get SMTP settings
    /// </summary>
    [HttpGet("smtp-settings")]
    public async Task<ActionResult> GetSettings()
    {
        try
        {
            var s = await _settingsService.GetAsync();
            if (s == null) return NotFound(new { message = "SMTP settings not found" });
            return Ok(new
            {
                s.Id,
                s.Host,
                s.Port,
                s.UseSsl,
                s.UserName,
                Password = "******",
                s.FromName,
                s.FromEmail,
                s.TimeoutMs,
                s.RetryCount,
                s.UpdatedAt,
                s.UpdatedBy
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting SMTP settings");
            return StatusCode(500, new { message = "Error getting SMTP settings" });
        }
    }

    /// <summary>
    /// Update SMTP settings
    /// </summary>
    [HttpPut("smtp-settings")]
    public async Task<ActionResult> UpdateSettings([FromBody] UpdateSmtpRequest req)
    {
        try
        {
            var entity = new SmtpSettings
            {
                Host = req.Host,
                Port = req.Port,
                UseSsl = req.UseSsl,
                UserName = req.UserName,
                PasswordEnc = req.Password ?? string.Empty,
                FromName = req.FromName,
                FromEmail = req.FromEmail,
                TimeoutMs = req.TimeoutMs,
                RetryCount = req.RetryCount
            };
            await _settingsService.UpsertAsync(entity, User?.Identity?.Name);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating SMTP settings");
            return StatusCode(500, new { message = "Error updating SMTP settings" });
        }
    }

    /// <summary>
    /// Send test email
    /// </summary>
    [HttpPost("test-send")]
    public async Task<ActionResult> TestSend([FromBody] TestSendRequest req)
    {
        try
        {
            string subject = req.Subject;
            string? bodyHtml = req.Body;
            string? templateKey = null;

            // If template key provided, use template
            if (!string.IsNullOrEmpty(req.TemplateKey))
            {
                var template = await _templateService.GetByKeyAsync(req.TemplateKey);
                if (template != null && template.IsActive)
                {
                    templateKey = req.TemplateKey; // Store template key for logging
                    
                    // Determine language preference: use req.Language if provided, otherwise try TR > EN > DE > AR
                    string? preferredLang = req.Language?.ToUpper();
                    
                    // Get subject based on language preference
                    if (!string.IsNullOrEmpty(preferredLang))
                    {
                        subject = preferredLang switch
                        {
                            "TR" => template.Subject_TR ?? template.Subject_EN ?? template.Subject_DE ?? template.Subject_AR ?? req.Subject,
                            "EN" => template.Subject_EN ?? template.Subject_TR ?? template.Subject_DE ?? template.Subject_AR ?? req.Subject,
                            "DE" => template.Subject_DE ?? template.Subject_EN ?? template.Subject_TR ?? template.Subject_AR ?? req.Subject,
                            "AR" => template.Subject_AR ?? template.Subject_TR ?? template.Subject_EN ?? template.Subject_DE ?? req.Subject,
                            _ => template.Subject_TR ?? template.Subject_EN ?? template.Subject_DE ?? template.Subject_AR ?? req.Subject
                        };
                        
                        bodyHtml = preferredLang switch
                        {
                            "TR" => template.BodyHtml_TR ?? template.BodyHtml_EN ?? template.BodyHtml_DE ?? template.BodyHtml_AR ?? req.Body,
                            "EN" => template.BodyHtml_EN ?? template.BodyHtml_TR ?? template.BodyHtml_DE ?? template.BodyHtml_AR ?? req.Body,
                            "DE" => template.BodyHtml_DE ?? template.BodyHtml_EN ?? template.BodyHtml_TR ?? template.BodyHtml_AR ?? req.Body,
                            "AR" => template.BodyHtml_AR ?? template.BodyHtml_TR ?? template.BodyHtml_EN ?? template.BodyHtml_DE ?? req.Body,
                            _ => template.BodyHtml_TR ?? template.BodyHtml_EN ?? template.BodyHtml_DE ?? template.BodyHtml_AR ?? req.Body
                        };
                    }
                    else
                    {
                        // Default: Try TR > EN > DE > AR (prioritize Turkish, then English, then German, then Arabic)
                        subject = template.Subject_TR ?? template.Subject_EN ?? template.Subject_DE ?? template.Subject_AR ?? req.Subject;
                        bodyHtml = template.BodyHtml_TR ?? template.BodyHtml_EN ?? template.BodyHtml_DE ?? template.BodyHtml_AR ?? req.Body;
                    }
                    
                    // Validate that we have body content
                    if (string.IsNullOrWhiteSpace(bodyHtml))
                    {
                        _logger.LogWarning("Template '{TemplateKey}' has empty body content for all languages", req.TemplateKey);
                        return BadRequest(new { message = $"Template '{req.TemplateKey}' has no body content. Please add content to at least one language." });
                    }
                }
                else if (template != null && !template.IsActive)
                {
                    return BadRequest(new { message = $"Template '{req.TemplateKey}' is not active" });
                }
                else
                {
                    return NotFound(new { message = $"Template '{req.TemplateKey}' not found" });
                }
            }

            // Validate body content before sending
            if (string.IsNullOrWhiteSpace(bodyHtml))
            {
                return BadRequest(new { message = "Email body cannot be empty" });
            }

            await _emailSender.SendAsync(new EmailMessage
            {
                To = new List<string> { req.To },
                Subject = subject,
                BodyHtml = bodyHtml,
                TemplateKey = templateKey // Store template key for tracking
            });
            return Ok(new { message = "Test email sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending test email");
            return StatusCode(500, new { message = "Error sending test email: " + ex.Message });
        }
    }

    /// <summary>
    /// Get email logs with filtering and pagination
    /// </summary>
    [HttpGet("logs")]
    public async Task<ActionResult> GetEmailLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? status = null)
    {
        try
        {
            var query = _context.EmailLogs.AsQueryable();

            // Filter by status if provided (0=Queued, 1=Sent, 2=Failed)
            if (status.HasValue && status.Value >= 0)
            {
                query = query.Where(e => (int)e.Status == status.Value);
            }

            query = query.OrderByDescending(e => e.CreatedAt);

            var skip = (page - 1) * pageSize;
            var logs = await query
                .Skip(skip)
                .Take(pageSize)
                .Select(e => new
                {
                    e.Id,
                    e.CorrelationId,
                    e.FromEmail,
                    e.FromName,
                    e.ToEmails,
                    e.CcEmails,
                    e.BccEmails,
                    e.Subject,
                    e.BodyHtml,
                    e.BodyText,
                    e.Status,
                    e.AttemptCount,
                    e.LastAttemptAt,
                    e.LastError,
                    e.SmtpHost,
                    e.SmtpPort,
                    e.UsedSsl,
                    e.UsedUserName,
                    e.TemplateKey,
                    e.CreatedAt
                })
                .ToListAsync();

            var total = await query.CountAsync();

            return Ok(new
            {
                items = logs,
                page,
                pageSize,
                total,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching email logs");
            return StatusCode(500, new { message = "Error fetching email logs" });
        }
    }

    /// <summary>
    /// Get email log by ID
    /// </summary>
    [HttpGet("logs/{id}")]
    public async Task<ActionResult> GetEmailLog(long id)
    {
        try
        {
            var log = await _context.EmailLogs.FindAsync(id);
            if (log == null)
            {
                return NotFound(new { message = "Email log not found" });
            }
            return Ok(new
            {
                log.Id,
                log.CorrelationId,
                log.FromEmail,
                log.FromName,
                log.ToEmails,
                log.CcEmails,
                log.BccEmails,
                log.Subject,
                log.BodyHtml,
                log.BodyText,
                log.Status,
                log.AttemptCount,
                log.LastAttemptAt,
                log.LastError,
                log.SmtpHost,
                log.SmtpPort,
                log.UsedSsl,
                log.UsedUserName,
                log.TemplateKey,
                log.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching email log {Id}", id);
            return StatusCode(500, new { message = "Error fetching email log" });
        }
    }
}

public class UpdateSmtpRequest
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public bool UseSsl { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string FromName { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public int? TimeoutMs { get; set; }
    public int RetryCount { get; set; } = 3;
}

public class TestSendRequest
{
    public required string To { get; set; }
    public string? TemplateKey { get; set; }
    public string? Language { get; set; } // Optional: "TR", "EN", "DE", "AR"
    public string Subject { get; set; } = "Test Email";
    public string Body { get; set; } = "This is a test email.";
}

