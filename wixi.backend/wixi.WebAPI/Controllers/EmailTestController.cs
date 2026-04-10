using Microsoft.AspNetCore.Mvc;
using wixi.Email.Interfaces;
using wixi.Email.DTOs;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v1.0/[controller]")]
public class EmailTestController : ControllerBase
{
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<EmailTestController> _logger;
    private readonly IConfiguration _configuration;

    public EmailTestController(
        IEmailTemplateService emailTemplateService,
        IEmailSender emailSender,
        ILogger<EmailTestController> logger,
        IConfiguration configuration)
    {
        _emailTemplateService = emailTemplateService;
        _emailSender = emailSender;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Test email gönderir - template key ile
    /// </summary>
    [HttpPost("send")]
    public async Task<IActionResult> SendTestEmail([FromBody] SendTestEmailRequest request)
    {
        try
        {
            // Template'i al
            var template = await _emailTemplateService.GetByKeyAsync(request.TemplateKey);
            if (template == null || !template.IsActive)
            {
                return NotFound(new { error = $"Template '{request.TemplateKey}' bulunamadı veya aktif değil" });
            }

            // Dil seçimi
            var language = request.Language?.ToLower() ?? "tr";
            var subject = language switch
            {
                "tr" => template.Subject_TR ?? template.Subject_EN ?? template.Subject_DE ?? "Test Email",
                "en" => template.Subject_EN ?? template.Subject_TR ?? template.Subject_DE ?? "Test Email",
                "de" => template.Subject_DE ?? template.Subject_EN ?? template.Subject_TR ?? "Test Email",
                "ar" => template.Subject_AR ?? template.Subject_EN ?? template.Subject_TR ?? "Test Email",
                _ => template.Subject_TR ?? template.Subject_EN ?? "Test Email"
            };

            var body = language switch
            {
                "tr" => template.BodyHtml_TR ?? template.BodyHtml_EN ?? template.BodyHtml_DE ?? "",
                "en" => template.BodyHtml_EN ?? template.BodyHtml_TR ?? template.BodyHtml_DE ?? "",
                "de" => template.BodyHtml_DE ?? template.BodyHtml_EN ?? template.BodyHtml_TR ?? "",
                "ar" => template.BodyHtml_AR ?? template.BodyHtml_EN ?? template.BodyHtml_TR ?? "",
                _ => template.BodyHtml_TR ?? template.BodyHtml_EN ?? ""
            };

            // Placeholder'ları değiştir
            var placeholders = request.Placeholders ?? GetDefaultPlaceholders(request.TemplateKey);
            foreach (var kvp in placeholders)
            {
                subject = subject.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
                body = body.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
            }

            // Email gönder
            var correlationId = Guid.NewGuid().ToString();
            var emailMessage = new EmailMessage
            {
                To = new List<string> { request.ToEmail },
                Subject = $"[TEST] {subject}",
                BodyHtml = body,
                TemplateKey = request.TemplateKey,
                CorrelationId = correlationId,
                Metadata = new Dictionary<string, string>
                {
                    { "Type", "TestEmail" },
                    { "TemplateKey", request.TemplateKey },
                    { "Language", language },
                    { "SentBy", "EmailTestController" }
                }
            };

            await _emailSender.SendAsync(emailMessage);

            _logger.LogInformation("Test email sent: Template={TemplateKey}, To={ToEmail}, CorrelationId={CorrelationId}",
                request.TemplateKey, request.ToEmail, correlationId);

            return Ok(new
            {
                success = true,
                message = "Test email başarıyla gönderildi",
                correlationId,
                templateKey = request.TemplateKey,
                toEmail = request.ToEmail,
                language,
                subject = $"[TEST] {subject}",
                placeholdersUsed = placeholders
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Test email gönderimi başarısız: TemplateKey={TemplateKey}", request.TemplateKey);
            return StatusCode(500, new { error = "Email gönderimi başarısız", details = ex.Message });
        }
    }

    /// <summary>
    /// Tüm aktif template'leri listeler
    /// </summary>
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        try
        {
            var templates = await _emailTemplateService.GetAllAsync();
            var activeTemplates = templates
                .Where(t => t.IsActive)
                .Select(t => new
                {
                    t.Key,
                    t.DisplayName_TR,
                    t.DisplayName_EN,
                    t.Description,
                    Placeholders = ExtractPlaceholders(t.BodyHtml_TR ?? t.BodyHtml_EN ?? "")
                })
                .OrderBy(t => t.Key)
                .ToList();

            return Ok(new
            {
                success = true,
                count = activeTemplates.Count,
                templates = activeTemplates
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Template listesi alınamadı");
            return StatusCode(500, new { error = "Template listesi alınamadı", details = ex.Message });
        }
    }

    /// <summary>
    /// Belirli bir template'in detayını getirir
    /// </summary>
    [HttpGet("templates/{key}")]
    public async Task<IActionResult> GetTemplate(string key)
    {
        try
        {
            var template = await _emailTemplateService.GetByKeyAsync(key);
            if (template == null)
            {
                return NotFound(new { error = $"Template '{key}' bulunamadı" });
            }

            var placeholders = ExtractPlaceholders(template.BodyHtml_TR ?? template.BodyHtml_EN ?? "");
            var defaultValues = GetDefaultPlaceholders(key);

            return Ok(new
            {
                success = true,
                template = new
                {
                    template.Key,
                    template.DisplayName_TR,
                    template.DisplayName_EN,
                    template.Description,
                    template.Subject_TR,
                    template.Subject_EN,
                    template.Subject_DE,
                    template.Subject_AR,
                    template.IsActive,
                    template.UpdatedAt
                },
                placeholders,
                defaultPlaceholderValues = defaultValues
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Template detayı alınamadı: Key={Key}", key);
            return StatusCode(500, new { error = "Template detayı alınamadı", details = ex.Message });
        }
    }

    /// <summary>
    /// Template'den placeholder'ları çıkarır
    /// </summary>
    private List<string> ExtractPlaceholders(string template)
    {
        var placeholders = new HashSet<string>();
        var matches = System.Text.RegularExpressions.Regex.Matches(template, @"\{\{(\w+)\}\}");
        
        foreach (System.Text.RegularExpressions.Match match in matches)
        {
            if (match.Groups.Count > 1)
            {
                placeholders.Add(match.Groups[1].Value);
            }
        }
        
        return placeholders.OrderBy(p => p).ToList();
    }

    /// <summary>
    /// Template key'e göre varsayılan placeholder değerleri
    /// </summary>
    private Dictionary<string, string> GetDefaultPlaceholders(string templateKey)
    {
        var now = DateTime.Now;
        var defaults = new Dictionary<string, string>
        {
            { "ClientName", "Test Kullanıcı" },
            { "FullName", "Test Kullanıcı" },
            { "CompanyName", "Test Şirketi A.Ş." },
            { "ContactPerson", "Ahmet Yılmaz" },
            { "SubmissionDate", now.ToString("dd/MM/yyyy") },
            { "CompletionDate", now.ToString("dd/MM/yyyy") },
            { "ExpirationDate", now.AddDays(3).ToString("dd/MM/yyyy HH:mm") },
            { "ClientCode", "WL-TEST-12345" },
            { "NextSteps", "• Manuel inceleme yapılacak\n• Müşteri kodu atanacak\n• Belge listesi paylaşılacak" },
            { "PortalLink", _configuration["Portal:BaseUrl"] ?? "https://portal.worklines.de" },
            { "SupportEmail", _configuration["Support:Email"] ?? "support@worklines.de" },
            { "RegisterUrl", _configuration["Portal:BaseUrl"] ?? "https://portal.worklines.de" + "/register" },
            { "DocumentName", "Test Belgesi" },
            { "UploadedAt", now.ToString("dd/MM/yyyy HH:mm") },
            { "StepTitle", "1. Adım - Ön Değerlendirme" },
            { "SubStepName", "Belge Kontrolü" },
            { "ProgressPercentage", "35" },
            { "NextStepTitle", "2. Adım - Denklik İşlemleri" },
            { "NextStepDescription", "Eğitim belgelerinizin denklik işlemleri başlatılacak" },
            { "FirstName", "Ahmet" },
            { "LastName", "Yılmaz" },
            { "Email", "test@example.com" },
            { "Phone", "+90 555 123 4567" },
            { "Message", "Test mesajı içeriği" },
            { "Profession", "Yazılım Geliştirici" },
            { "Experience", "5" },
            { "GermanLevel", "B2" },
            { "Industry", "Teknoloji" },
            { "Positions", "Backend Developer, DevOps Engineer" },
            { "Requirements", "C#, .NET Core, Docker, Kubernetes" },
            { "Priority", "Yüksek" },
            { "Notes", "Test notları" }
        };

        return defaults;
    }
}

public class SendTestEmailRequest
{
    /// <summary>
    /// Email template key (örn: form_submission_received_employer)
    /// </summary>
    public string TemplateKey { get; set; } = string.Empty;

    /// <summary>
    /// Alıcı email adresi
    /// </summary>
    public string ToEmail { get; set; } = string.Empty;

    /// <summary>
    /// Dil (tr, en, de, ar)
    /// </summary>
    public string? Language { get; set; } = "tr";

    /// <summary>
    /// Özel placeholder değerleri (opsiyonel)
    /// </summary>
    public Dictionary<string, string>? Placeholders { get; set; }
}

