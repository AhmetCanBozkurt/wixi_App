using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Email.DTOs;
using wixi.Email.Interfaces;
using wixi.Forms.Entities;
using wixi.Clients.Entities;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/form-submissions")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminFormSubmissionsController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminFormSubmissionsController> _logger;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly IWebHostEnvironment _env;

    public AdminFormSubmissionsController(
        WixiDbContext context,
        ILogger<AdminFormSubmissionsController> logger,
        IEmailSender emailSender,
        IEmailTemplateService emailTemplateService,
        IWebHostEnvironment env)
    {
        _context = context;
        _logger = logger;
        _emailSender = emailSender;
        _emailTemplateService = emailTemplateService;
        _env = env;
    }

    /// <summary>
    /// List employer form submissions (admin)
    /// </summary>
    [HttpGet("employers")]
    public async Task<ActionResult> GetEmployerSubmissions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? industry = null)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.EmployerFormSubmissions.AsNoTracking().OrderByDescending(e => e.CreatedAt).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(e =>
                    e.CompanyName.ToLower().Contains(s) ||
                    e.ContactPerson.ToLower().Contains(s) ||
                    e.Email.ToLower().Contains(s) ||
                    e.Phone.ToLower().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(industry))
            {
                var i = industry.ToLower();
                query = query.Where(e => e.Industry.ToLower().Contains(i));
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new { success = true, total, page, pageSize, items });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employer submissions");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching employer submissions" });
        }
    }

    /// <summary>
    /// Get employer form submission by ID (admin)
    /// </summary>
    [HttpGet("employers/{id}")]
    public async Task<ActionResult> GetEmployerSubmissionById(int id)
    {
        try
        {
            var submission = await _context.EmployerFormSubmissions
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (submission == null)
            {
                return NotFound(new { success = false, message = "Employer submission not found" });
            }

            return Ok(new { success = true, item = submission });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employer submission by ID: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching employer submission" });
        }
    }

    /// <summary>
    /// List employee form submissions (admin)
    /// </summary>
    [HttpGet("employees")]
    public async Task<ActionResult> GetEmployeeSubmissions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? profession = null)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.EmployeeFormSubmissions
                .AsNoTracking()
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new
                {
                    e.Id,
                    e.CreatedAt,
                    e.Salutation,
                    e.FullName,
                    e.Email,
                    e.Phone,
                    e.Profession,
                    e.Experience,
                    e.Education,
                    e.GermanLevel,
                    e.AdditionalInfo,
                    e.SpecialRequests,
                    e.Language,
                    e.Status,
                    ClientCode = _context.Clients
                        .Where(c => c.Email == e.Email)
                        .Select(c => c.ClientCode)
                        .FirstOrDefault(),
                    ClientCreatedAt = _context.Clients
                        .Where(c => c.Email == e.Email)
                        .Select(c => c.CreatedAt)
                        .FirstOrDefault()
                })
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(e =>
                    e.FullName.ToLower().Contains(s) ||
                    e.Email.ToLower().Contains(s) ||
                    e.Phone.ToLower().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(profession))
            {
                var p = profession.ToLower();
                query = query.Where(e => e.Profession != null && e.Profession.ToLower().Contains(p));
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new { success = true, total, page, pageSize, items });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee submissions");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching employee submissions" });
        }
    }

    /// <summary>
    /// Get employee form submission by ID (admin)
    /// </summary>
    [HttpGet("employees/{id}")]
    public async Task<ActionResult> GetEmployeeSubmissionById(int id)
    {
        try
        {
            var submission = await _context.EmployeeFormSubmissions
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (submission == null)
            {
                return NotFound(new { success = false, message = "Employee submission not found" });
            }

            return Ok(new { success = true, item = submission });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee submission by ID: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching employee submission" });
        }
    }

    /// <summary>
    /// Download CV file for employee submission (admin)
    /// </summary>
    [HttpGet("employees/{id}/cv")]
    public async Task<ActionResult> DownloadEmployeeCv(int id)
    {
        try
        {
            var submission = await _context.EmployeeFormSubmissions
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (submission == null)
            {
                return NotFound(new { success = false, message = "Employee submission not found" });
            }

            if (string.IsNullOrEmpty(submission.CvFilePath) || string.IsNullOrEmpty(submission.CvFileName))
            {
                return NotFound(new { success = false, message = "CV file not found for this submission" });
            }

            // Get file path
            var fullPath = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, submission.CvFilePath.TrimStart('/', '\\'));

            if (!System.IO.File.Exists(fullPath))
            {
                _logger.LogWarning("CV file not found on disk: {FilePath}", fullPath);
                return NotFound(new { success = false, message = "CV file not found on server" });
            }

            // Determine content type based on file extension
            var extension = Path.GetExtension(submission.CvFileName).ToLowerInvariant();
            var contentType = extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _ => "application/octet-stream"
            };

            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            return File(fileBytes, contentType, submission.CvFileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading CV for employee submission: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while downloading CV" });
        }
    }

    /// <summary>
    /// Create client code from employee submission
    /// </summary>
    [HttpPost("employees/{id}/create-client")]
    public async Task<ActionResult> CreateClientFromEmployeeSubmission(int id)
    {
        try
        {
            var submission = await _context.EmployeeFormSubmissions
                .FirstOrDefaultAsync(e => e.Id == id);

            if (submission == null)
            {
                return NotFound(new { success = false, message = "Employee submission not found" });
            }

            // Check if client already exists for this email
            var existingClient = await _context.Clients
                .FirstOrDefaultAsync(c => c.Email == submission.Email);

            if (existingClient != null)
            {
                return BadRequest(new { success = false, message = "Client already exists for this email", clientCode = existingClient.ClientCode });
            }

            // Check if there's already a pending code for this email that is still valid
            var existingPendingCode = await _context.PendingClientCodes
                .FirstOrDefaultAsync(p => p.Email == submission.Email && !p.IsUsed && p.ExpirationDate > DateTime.UtcNow);

            if (existingPendingCode != null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "A valid client code already exists for this email",
                    clientCode = existingPendingCode.ClientCode,
                    expirationDate = existingPendingCode.ExpirationDate
                });
            }

            // Generate unique client code
            string clientCode;
            bool isUnique = false;
            int attempts = 0;
            const int maxAttempts = 10;

            do
            {
                clientCode = $"CL-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(10000, 99999)}";
                var codeExists = await _context.PendingClientCodes.AnyAsync(p => p.ClientCode == clientCode) ||
                                 await _context.Clients.AnyAsync(c => c.ClientCode == clientCode);
                isUnique = !codeExists;
                attempts++;
            } while (!isUnique && attempts < maxAttempts);

            if (!isUnique)
            {
                _logger.LogError("Failed to generate unique client code after {Attempts} attempts", attempts);
                return StatusCode(500, new { success = false, message = "Failed to generate unique client code" });
            }

            // Set expiration date (3 days from now)
            var expirationDate = DateTime.UtcNow.AddDays(3);

            // Create pending client code record
            var pendingCode = new PendingClientCode
            {
                ClientCode = clientCode,
                Email = submission.Email,
                FullName = submission.FullName,
                ExpirationDate = expirationDate,
                EmployeeSubmissionId = id,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow,
                Code = Guid.NewGuid().ToString("N")[..8].ToUpper() // Generate verification code
            };

            _context.PendingClientCodes.Add(pendingCode);
            await _context.SaveChangesAsync();

            // Send email to client using template
            var baseUrl = "https://worklines.com.tr";
            var registerUrl = $"{baseUrl}/register?code={Uri.EscapeDataString(clientCode)}";

            // Get email template
            var templateDto = await _emailTemplateService.GetByKeyAsync("ClientCode");
            string emailSubject;
            string emailBody;

            if (templateDto != null && templateDto.IsActive)
            {
                // Use language from submission, default to Turkish
                var emailLanguage = !string.IsNullOrWhiteSpace(submission.Language) ? submission.Language.ToLower() : "tr";
                
                emailSubject = emailLanguage switch
                {
                    "tr" => templateDto.Subject_TR ?? templateDto.Subject_EN ?? templateDto.Subject_DE ?? "Worklines'a Hoş Geldiniz",
                    "en" => templateDto.Subject_EN ?? templateDto.Subject_TR ?? templateDto.Subject_DE ?? "Welcome to Worklines",
                    "de" => templateDto.Subject_DE ?? templateDto.Subject_EN ?? templateDto.Subject_TR ?? "Willkommen bei Worklines",
                    "ar" => templateDto.Subject_AR ?? templateDto.Subject_EN ?? templateDto.Subject_TR ?? "مرحبا بك في Worklines",
                    _ => templateDto.Subject_TR ?? templateDto.Subject_EN ?? templateDto.Subject_DE ?? "Worklines'a Hoş Geldiniz"
                };

                emailBody = emailLanguage switch
                {
                    "tr" => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_DE ?? "",
                    "en" => templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? templateDto.BodyHtml_DE ?? "",
                    "de" => templateDto.BodyHtml_DE ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                    "ar" => templateDto.BodyHtml_AR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                    _ => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_DE ?? ""
                };

                // Replace placeholders
                emailBody = emailBody
                    .Replace("{{FullName}}", submission.FullName)
                    .Replace("{{ClientCode}}", clientCode)
                    .Replace("{{ExpirationDate}}", expirationDate.ToString("dd.MM.yyyy HH:mm"))
                    .Replace("{{RegisterUrl}}", registerUrl);

                emailSubject = emailSubject
                    .Replace("{{ClientCode}}", clientCode);
            }
            else
            {
                // Fallback to hardcoded template
                emailSubject = $"Willkommen bei Worklines - Ihr Kundenkode: {clientCode}";
                emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }}
        .code-box {{ background-color: white; border: 2px solid #2563eb; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px; }}
        .code {{ font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Willkommen bei Worklines</h1>
        </div>
        <div class='content'>
            <p>Sehr geehrte/r {submission.FullName},</p>
            <p>Vielen Dank für Ihr Interesse an unseren Dienstleistungen. Wir haben Ihnen einen persönlichen Kundenkode erstellt.</p>
            <div class='code-box'>
                <div class='code'>{clientCode}</div>
            </div>
            <p>Mit diesem Kode können Sie sich in unserem System registrieren und Ihre Bewerbung fortsetzen.</p>
            <p><a href='{registerUrl}'>Jetzt registrieren</a></p>
        </div>
    </div>
</body>
</html>";
            }

            var emailMessage = new EmailMessage
            {
                To = new List<string> { submission.Email },
                Subject = emailSubject,
                BodyHtml = emailBody,
                TemplateKey = templateDto != null && templateDto.IsActive ? "ClientCode" : null, // Store template key
                CorrelationId = Guid.NewGuid().ToString(),
                Metadata = new Dictionary<string, string>
                {
                    { "Type", "ClientCode" },
                    { "SubmissionId", submission.Id.ToString() },
                    { "PendingCodeId", pendingCode.Id.ToString() },
                    { "ClientCode", clientCode },
                    { "ExpirationDate", expirationDate.ToString("O") }
                }
            };

            await _emailSender.SendAsync(emailMessage);

            _logger.LogInformation("Client code created from employee submission: {SubmissionId} -> Code: {Code}, Expires: {ExpirationDate}",
                id, clientCode, expirationDate);

            return Ok(new
            {
                success = true,
                message = "Client code created successfully and email sent",
                clientCode = clientCode,
                expirationDate = expirationDate,
                registerUrl = registerUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating client from employee submission: {Id}", id);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// List contact form submissions (admin)
    /// </summary>
    [HttpGet("contacts")]
    public async Task<ActionResult> GetContactSubmissions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.ContactFormSubmissions.AsNoTracking().OrderByDescending(e => e.CreatedAt).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(e =>
                    (e.FirstName != null && e.FirstName.ToLower().Contains(s)) ||
                    (e.LastName != null && e.LastName.ToLower().Contains(s)) ||
                    e.Email.ToLower().Contains(s) ||
                    (e.Phone != null && e.Phone.ToLower().Contains(s)));
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new { success = true, total, page, pageSize, items });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching contact submissions");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching contact submissions" });
        }
    }

    /// <summary>
    /// List pending client codes (admin)
    /// </summary>
    [HttpGet("pending-client-codes")]
    public async Task<ActionResult> GetPendingClientCodes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.PendingClientCodes
                .AsNoTracking()
                .OrderByDescending(p => p.CreatedAt)
                .AsQueryable();

            // Filter by status: "used", "unused", "expired", "valid"
            if (!string.IsNullOrWhiteSpace(status))
            {
                var statusLower = status.ToLower();
                query = statusLower switch
                {
                    "used" => query.Where(p => p.IsUsed),
                    "unused" => query.Where(p => !p.IsUsed),
                    "expired" => query.Where(p => p.ExpirationDate < DateTime.UtcNow),
                    "valid" => query.Where(p => !p.IsUsed && p.ExpirationDate >= DateTime.UtcNow),
                    _ => query
                };
            }

            // Search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(p =>
                    (p.ClientCode != null && p.ClientCode.ToLower().Contains(s)) ||
                    (p.Email != null && p.Email.ToLower().Contains(s)) ||
                    (p.FullName != null && p.FullName.ToLower().Contains(s)));
            }

            var total = await query.CountAsync();

            var items = await query
                .Select(p => new
                {
                    p.Id,
                    p.ClientCode,
                    p.Email,
                    p.FullName,
                    p.ExpirationDate,
                    p.IsUsed,
                    p.UsedAt,
                    p.CreatedAt,
                    p.EmployeeSubmissionId,
                    IsExpired = p.ExpirationDate < DateTime.UtcNow,
                    IsValid = !p.IsUsed && p.ExpirationDate >= DateTime.UtcNow
                })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { success = true, total, page, pageSize, items });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching pending client codes");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching pending client codes", error = ex.Message });
        }
    }
}

