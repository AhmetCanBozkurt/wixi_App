using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using wixi.DataAccess;
using wixi.Forms.DTOs;
using wixi.Forms.Entities;
using wixi.Forms.Interfaces;
using wixi.Documents.Interfaces;
using wixi.Email.Interfaces;
using wixi.Email.DTOs;
using wixi.Content.Interfaces;

namespace wixi.WebAPI.Services;

public class FormService : IFormService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<FormService> _logger;
    private readonly IFileStorageService? _fileStorageService;
    private readonly IEmailSender? _emailSender;
    private readonly IEmailTemplateService? _emailTemplateService;
    private readonly IContentService? _contentService;
    private readonly IConfiguration _configuration;

    public FormService(
        WixiDbContext context, 
        ILogger<FormService> logger,
        IConfiguration configuration,
        IFileStorageService? fileStorageService = null,
        IEmailSender? emailSender = null,
        IEmailTemplateService? emailTemplateService = null,
        IContentService? contentService = null)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
        _fileStorageService = fileStorageService;
        _emailSender = emailSender;
        _emailTemplateService = emailTemplateService;
        _contentService = contentService;
    }

    #region Employer Forms

    public async Task<EmployerFormDto> SubmitEmployerFormAsync(SubmitEmployerFormDto dto, string ipAddress, string userAgent)
    {
        var submission = new EmployerFormSubmission
        {
            CompanyName = dto.CompanyName,
            ContactPerson = dto.ContactPerson,
            Email = dto.Email,
            Phone = dto.Phone,
            Industry = dto.Industry,
            CompanySize = dto.CompanySize,
            Positions = dto.Positions,
            Requirements = dto.Requirements,
            Message = dto.Message,
            SpecialRequests = dto.SpecialRequests,
            RequestIp = ipAddress,
            UserAgent = userAgent,
            Language = dto.Language,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.EmployerFormSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        // Send confirmation email to the employer
        await SendEmployerFormConfirmationEmailAsync(submission, dto.Language);

        _logger.LogInformation("Employer form submitted: ID={Id}, Company={Company}, EmailLogId={EmailLogId}", 
            submission.Id, submission.CompanyName, submission.EmailLogId);

        return MapToEmployerFormDto(submission);
    }

    public async Task<EmployerFormDto?> GetEmployerFormByIdAsync(int id)
    {
        var form = await _context.EmployerFormSubmissions.FindAsync(id);
        return form == null ? null : MapToEmployerFormDto(form);
    }

    public async Task<List<EmployerFormDto>> GetAllEmployerFormsAsync()
    {
        var forms = await _context.EmployerFormSubmissions
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return forms.Select(MapToEmployerFormDto).ToList();
    }

    public async Task<bool> UpdateEmployerFormStatusAsync(int id, string status, string? adminNotes = null)
    {
        var form = await _context.EmployerFormSubmissions.FindAsync(id);
        if (form == null) return false;

        form.Status = status;
        form.AdminNotes = adminNotes;
        form.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Employer form status updated: ID={Id}, Status={Status}", id, status);
        return true;
    }

    private static EmployerFormDto MapToEmployerFormDto(EmployerFormSubmission entity)
    {
        return new EmployerFormDto
        {
            Id = entity.Id,
            CreatedAt = entity.CreatedAt,
            CompanyName = entity.CompanyName,
            ContactPerson = entity.ContactPerson,
            Email = entity.Email,
            Phone = entity.Phone,
            Industry = entity.Industry,
            CompanySize = entity.CompanySize,
            Positions = entity.Positions,
            Requirements = entity.Requirements,
            Message = entity.Message,
            SpecialRequests = entity.SpecialRequests,
            Status = entity.Status,
            AdminNotes = entity.AdminNotes,
            UpdatedAt = entity.UpdatedAt,
            EmailLogId = entity.EmailLogId
        };
    }

    #endregion

    #region Employee Forms

    public async Task<EmployeeFormDto> SubmitEmployeeFormAsync(SubmitEmployeeFormDto dto, string ipAddress, string userAgent)
    {
        var submission = new EmployeeFormSubmission
        {
            Salutation = dto.Salutation,
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            Profession = dto.Profession,
            Experience = dto.Experience,
            Education = dto.Education,
            GermanLevel = dto.GermanLevel,
            AdditionalInfo = dto.AdditionalInfo,
            CvFileName = dto.CvFileName,
            CvFilePath = dto.CvFilePath,
            CvFileSize = dto.CvFileSize,
            SpecialRequests = dto.SpecialRequests,
            RequestIp = ipAddress,
            UserAgent = userAgent,
            Language = dto.Language,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.EmployeeFormSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        // Send confirmation email to the applicant
        await SendEmployeeFormConfirmationEmailAsync(submission, dto.Language);

        _logger.LogInformation("Employee form submitted: ID={Id}, Name={Name}", 
            submission.Id, submission.FullName);

        return MapToEmployeeFormDto(submission);
    }

    public async Task<EmployeeFormDto> SubmitEmployeeFormAsync(
        string? salutation, string fullName, string email, string phone, 
        string? profession, int? experience, string? education, 
        string? germanLevel, string? additionalInfo, string? specialRequests, 
        string? language, IFormFile? cvFile, string ipAddress, string userAgent)
    {
        string? cvFileName = null;
        string? cvFilePath = null;
        long? cvFileSize = null;

        // Handle file upload if provided
        if (cvFile != null && cvFile.Length > 0)
        {
            try
            {
                // Validate file
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".txt" };
                var maxSizeBytes = 10 * 1024 * 1024; // 10MB
                
                if (_fileStorageService != null)
                {
                    var validation = await _fileStorageService.ValidateFileAsync(cvFile, allowedExtensions, maxSizeBytes);
                    if (!validation.IsValid)
                    {
                        throw new Exception(string.Join(", ", validation.Errors));
                    }

                    // Upload file to EmployeeForms directory
                    var uploadResult = await _fileStorageService.UploadFileAsync(cvFile, "EmployeeForms");
                    if (uploadResult.Success)
                    {
                        cvFileName = uploadResult.FileName;
                        cvFilePath = uploadResult.FilePath;
                        cvFileSize = uploadResult.FileSizeBytes;
                    }
                    else
                    {
                        _logger.LogWarning("File upload failed for employee form: {ErrorMessage}", uploadResult.ErrorMessage);
                    }
                }
                else
                {
                    // Fallback: just store file name if file storage service is not available
                    cvFileName = cvFile.FileName;
                    cvFileSize = cvFile.Length;
                    _logger.LogWarning("FileStorageService not available, storing file name only");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading CV file for employee form");
                // Don't fail the form submission if file upload fails
            }
        }

        var submission = new EmployeeFormSubmission
        {
            Salutation = salutation,
            FullName = fullName,
            Email = email,
            Phone = phone,
            Profession = profession,
            Experience = experience,
            Education = education,
            GermanLevel = germanLevel,
            AdditionalInfo = additionalInfo,
            CvFileName = cvFileName,
            CvFilePath = cvFilePath,
            CvFileSize = cvFileSize,
            SpecialRequests = specialRequests,
            RequestIp = ipAddress,
            UserAgent = userAgent,
            Language = language,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.EmployeeFormSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        // Send confirmation email to the applicant
        await SendEmployeeFormConfirmationEmailAsync(submission, language);

        _logger.LogInformation("Employee form submitted: ID={Id}, Name={Name}, EmailLogId={EmailLogId}", 
            submission.Id, submission.FullName, submission.EmailLogId);

        return MapToEmployeeFormDto(submission);
    }

    private async Task SendEmployerFormConfirmationEmailAsync(EmployerFormSubmission submission, string? language)
    {
        if (_emailSender == null || _emailTemplateService == null)
        {
            _logger.LogWarning("Email services not available, skipping email for employer form submission {SubmissionId}", submission.Id);
            return;
        }

        try
        {
            // Determine language for email (default to Turkish if not specified)
            var emailLanguage = !string.IsNullOrWhiteSpace(language) ? language.ToLower() : "tr";
            
            // Get email template for employer form confirmation
            var templateDto = await _emailTemplateService.GetByKeyAsync("form_submission_received_employer");
            string emailSubject;
            string emailBody;

            if (templateDto != null && templateDto.IsActive)
            {
                // Select language-specific content
                emailSubject = emailLanguage switch
                {
                    "tr" => templateDto.Subject_TR ?? templateDto.Subject_EN ?? templateDto.Subject_DE ?? "İşveren başvurunuz alındı",
                    "en" => templateDto.Subject_EN ?? templateDto.Subject_TR ?? templateDto.Subject_DE ?? "Your employer request has been received",
                    "de" => templateDto.Subject_DE ?? templateDto.Subject_EN ?? templateDto.Subject_TR ?? "Ihre Arbeitgeberanfrage wurde erhalten",
                    "ar" => templateDto.Subject_AR ?? templateDto.Subject_EN ?? templateDto.Subject_TR ?? "تم استلام طلب صاحب العمل",
                    _ => templateDto.Subject_TR ?? templateDto.Subject_EN ?? templateDto.Subject_DE ?? "İşveren başvurunuz alındı"
                };

                emailBody = emailLanguage switch
                {
                    "tr" => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_DE ?? "",
                    "en" => templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? templateDto.BodyHtml_DE ?? "",
                    "de" => templateDto.BodyHtml_DE ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                    "ar" => templateDto.BodyHtml_AR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                    _ => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_DE ?? ""
                };

                // Replace placeholders for new template
                var submissionDate = submission.CreatedAt.ToString("dd/MM/yyyy");
                var nextSteps = "• Başvurunuzun manuel incelenmesi\n• Müşteri kodu oluşturulması\n• Belge listesinin paylaşılması";
                
                // Get PortalLink and SupportEmail from SystemSettings
                var systemSettings = await _contentService?.GetSystemSettingsAsync()!;
                var portalLink = systemSettings?.PortalUrl ?? _configuration["Portal:BaseUrl"] ?? "https://portal.worklines.de";
                var supportEmail = systemSettings?.SupportEmail ?? _configuration["Support:Email"] ?? "support@worklines.de";
                
                emailBody = emailBody
                    .Replace("{{ClientName}}", submission.CompanyName)
                    .Replace("{{SubmissionDate}}", submissionDate)
                    .Replace("{{NextSteps}}", nextSteps)
                    .Replace("{{PortalLink}}", portalLink)
                    .Replace("{{SupportEmail}}", supportEmail);

                emailSubject = emailSubject
                    .Replace("{{SubmissionDate}}", submissionDate);
            }
            else
            {
                // Template not found in database - log error
                _logger.LogError("Email template 'form_submission_received_employer' not found or inactive in database");
                throw new InvalidOperationException("Email template not configured. Please contact administrator.");
            }

            // Generate correlation ID to track the email
            var correlationId = Guid.NewGuid().ToString();

            var emailMessage = new EmailMessage
            {
                To = new List<string> { submission.Email },
                Subject = emailSubject,
                BodyHtml = emailBody,
                TemplateKey = templateDto != null && templateDto.IsActive ? "form_submission_received_employer" : null,
                CorrelationId = correlationId,
                Metadata = new Dictionary<string, string>
                {
                    { "Type", "EmployerForm" },
                    { "SubmissionId", submission.Id.ToString() },
                    { "CompanyName", submission.CompanyName },
                    { "ContactPerson", submission.ContactPerson },
                    { "Email", submission.Email }
                }
            };

            await _emailSender.SendAsync(emailMessage);

            // Find the email log by correlation ID to get the EmailLogId
            // SmtpEmailSender creates EmailLog and saves it, so we can find it by CorrelationId
            var correlationGuid = Guid.Parse(correlationId);
            var emailLog = await _context.EmailLogs
                .Where(e => e.CorrelationId == correlationGuid)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

            // If not found immediately, try a few times with small delays (race condition)
            if (emailLog == null)
            {
                for (int i = 0; i < 5; i++)
                {
                    await Task.Delay(50);
                    emailLog = await _context.EmailLogs
                        .Where(e => e.CorrelationId == correlationGuid)
                        .OrderByDescending(e => e.CreatedAt)
                        .FirstOrDefaultAsync();
                    if (emailLog != null) break;
                }
            }

            if (emailLog != null)
            {
                // EmailLog.Id is long, but EmployerFormSubmission.EmailLogId is int?
                // Check if it fits in int range
                if (emailLog.Id > 0 && emailLog.Id <= int.MaxValue)
                {
                    submission.EmailLogId = (int)emailLog.Id;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Email sent for employer form submission {SubmissionId}, EmailLogId: {EmailLogId}", 
                        submission.Id, emailLog.Id);
                }
                else
                {
                    _logger.LogWarning("EmailLogId {EmailLogId} is too large for int, cannot save to EmployerFormSubmission {SubmissionId}", 
                        emailLog.Id, submission.Id);
                }
            }
            else
            {
                _logger.LogWarning("Could not find EmailLog for employer form submission {SubmissionId} with CorrelationId {CorrelationId}", 
                    submission.Id, correlationId);
            }
        }
        catch (Exception emailEx)
        {
            _logger.LogError(emailEx, "Failed to send email for employer form submission {SubmissionId}", submission.Id);
            // Don't fail the form submission if email fails
        }
    }

    private async Task SendEmployeeFormConfirmationEmailAsync(EmployeeFormSubmission submission, string? language)
    {
        if (_emailSender == null || _emailTemplateService == null)
        {
            _logger.LogWarning("Email services not available, skipping email for employee form submission {SubmissionId}", submission.Id);
            return;
        }

        try
        {
            // Determine language for email (default to Turkish if not specified)
            var emailLanguage = !string.IsNullOrWhiteSpace(language) ? language.ToLower() : "tr";
            
            // Get email template for employee form confirmation
            var templateDto = await _emailTemplateService.GetByKeyAsync("form_submission_received_employee");
            string emailSubject;
            string emailBody;

            if (templateDto != null && templateDto.IsActive)
            {
                // Select language-specific content
                emailSubject = emailLanguage switch
                {
                    "tr" => templateDto.Subject_TR ?? templateDto.Subject_EN ?? templateDto.Subject_DE ?? "Başvurunuz tarafımıza ulaştı",
                    "en" => templateDto.Subject_EN ?? templateDto.Subject_TR ?? templateDto.Subject_DE ?? "We received your application",
                    "de" => templateDto.Subject_DE ?? templateDto.Subject_EN ?? templateDto.Subject_TR ?? "Wir haben Ihre Bewerbung erhalten",
                    "ar" => templateDto.Subject_AR ?? templateDto.Subject_EN ?? templateDto.Subject_TR ?? "تلقينا طلبك",
                    _ => templateDto.Subject_TR ?? templateDto.Subject_EN ?? templateDto.Subject_DE ?? "Başvurunuz tarafımıza ulaştı"
                };

                emailBody = emailLanguage switch
                {
                    "tr" => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_DE ?? "",
                    "en" => templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? templateDto.BodyHtml_DE ?? "",
                    "de" => templateDto.BodyHtml_DE ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                    "ar" => templateDto.BodyHtml_AR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                    _ => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? templateDto.BodyHtml_DE ?? ""
                };

                // Replace placeholders for new template
                var submissionDate = submission.CreatedAt.ToString("dd/MM/yyyy");
                var nextSteps = "• Başvurunuzun manuel incelenmesi\n• Müşteri kodu oluşturulması\n• Belge listesinin paylaşılması";
                
                // Get PortalLink and SupportEmail from SystemSettings
                var systemSettings = await _contentService?.GetSystemSettingsAsync()!;
                var portalLink = systemSettings?.PortalUrl ?? _configuration["Portal:BaseUrl"] ?? "https://portal.worklines.de";
                var supportEmail = systemSettings?.SupportEmail ?? _configuration["Support:Email"] ?? "support@worklines.de";
                
                emailBody = emailBody
                    .Replace("{{ClientName}}", submission.FullName)
                    .Replace("{{SubmissionDate}}", submissionDate)
                    .Replace("{{NextSteps}}", nextSteps)
                    .Replace("{{PortalLink}}", portalLink)
                    .Replace("{{SupportEmail}}", supportEmail);

                emailSubject = emailSubject
                    .Replace("{{SubmissionDate}}", submissionDate);
            }
            else
            {
                // Template not found in database - log error
                _logger.LogError("Email template 'form_submission_received_employee' not found or inactive in database");
                throw new InvalidOperationException("Email template not configured. Please contact administrator.");
            }

            // Generate correlation ID to track the email
            var correlationId = Guid.NewGuid().ToString();

            var emailMessage = new EmailMessage
            {
                To = new List<string> { submission.Email },
                Subject = emailSubject,
                BodyHtml = emailBody,
                TemplateKey = templateDto != null && templateDto.IsActive ? "form_submission_received_employee" : null,
                CorrelationId = correlationId,
                Metadata = new Dictionary<string, string>
                {
                    { "Type", "EmployeeForm" },
                    { "SubmissionId", submission.Id.ToString() },
                    { "FullName", submission.FullName },
                    { "Email", submission.Email }
                }
            };

            await _emailSender.SendAsync(emailMessage);

            // Find the email log by correlation ID to get the EmailLogId
            // SmtpEmailSender creates EmailLog and saves it, so we can find it by CorrelationId
            var correlationGuid = Guid.Parse(correlationId);
            var emailLog = await _context.EmailLogs
                .Where(e => e.CorrelationId == correlationGuid)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

            // If not found immediately, try a few times with small delays (race condition)
            if (emailLog == null)
            {
                for (int i = 0; i < 5; i++)
                {
                    await Task.Delay(50);
                    emailLog = await _context.EmailLogs
                        .Where(e => e.CorrelationId == correlationGuid)
                        .OrderByDescending(e => e.CreatedAt)
                        .FirstOrDefaultAsync();
                    if (emailLog != null) break;
                }
            }

            if (emailLog != null)
            {
                // EmailLog.Id is long, but EmployeeFormSubmission.EmailLogId is int?
                // Check if it fits in int range
                if (emailLog.Id > 0 && emailLog.Id <= int.MaxValue)
                {
                    submission.EmailLogId = (int)emailLog.Id;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Email sent for employee form submission {SubmissionId}, EmailLogId: {EmailLogId}", 
                        submission.Id, emailLog.Id);
                }
                else
                {
                    _logger.LogWarning("EmailLogId {EmailLogId} is too large for int, cannot save to EmployeeFormSubmission {SubmissionId}", 
                        emailLog.Id, submission.Id);
                }
            }
            else
            {
                _logger.LogWarning("Could not find EmailLog for employee form submission {SubmissionId} with CorrelationId {CorrelationId}", 
                    submission.Id, correlationId);
            }
        }
        catch (Exception emailEx)
        {
            _logger.LogError(emailEx, "Failed to send email for employee form submission {SubmissionId}", submission.Id);
            // Don't fail the form submission if email fails
        }
    }

    public async Task<EmployeeFormDto?> GetEmployeeFormByIdAsync(int id)
    {
        var form = await _context.EmployeeFormSubmissions.FindAsync(id);
        return form == null ? null : MapToEmployeeFormDto(form);
    }

    public async Task<List<EmployeeFormDto>> GetAllEmployeeFormsAsync()
    {
        var forms = await _context.EmployeeFormSubmissions
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return forms.Select(MapToEmployeeFormDto).ToList();
    }

    public async Task<bool> UpdateEmployeeFormStatusAsync(int id, string status, string? adminNotes = null)
    {
        var form = await _context.EmployeeFormSubmissions.FindAsync(id);
        if (form == null) return false;

        form.Status = status;
        form.AdminNotes = adminNotes;
        form.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Employee form status updated: ID={Id}, Status={Status}", id, status);
        return true;
    }

    private static EmployeeFormDto MapToEmployeeFormDto(EmployeeFormSubmission entity)
    {
        return new EmployeeFormDto
        {
            Id = entity.Id,
            CreatedAt = entity.CreatedAt,
            Salutation = entity.Salutation,
            FullName = entity.FullName,
            Email = entity.Email,
            Phone = entity.Phone,
            Profession = entity.Profession,
            Experience = entity.Experience,
            Education = entity.Education,
            GermanLevel = entity.GermanLevel,
            AdditionalInfo = entity.AdditionalInfo,
            CvFileName = entity.CvFileName,
            CvFilePath = entity.CvFilePath,
            CvFileSize = entity.CvFileSize,
            SpecialRequests = entity.SpecialRequests,
            Status = entity.Status,
            AdminNotes = entity.AdminNotes,
            UpdatedAt = entity.UpdatedAt
        };
    }

    #endregion

    #region Contact Forms

    public async Task<ContactFormDto> SubmitContactFormAsync(SubmitContactFormDto dto, string ipAddress, string userAgent)
    {
        var submission = new ContactFormSubmission
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Age = dto.Age,
            Nationality = dto.Nationality,
            Education = dto.Education,
            FieldOfStudy = dto.FieldOfStudy,
            WorkExperience = dto.WorkExperience,
            GermanLevel = dto.GermanLevel,
            EnglishLevel = dto.EnglishLevel,
            Interest = dto.Interest,
            PreferredCity = dto.PreferredCity,
            Timeline = dto.Timeline,
            Message = dto.Message,
            PrivacyConsent = dto.PrivacyConsent,
            Newsletter = dto.Newsletter,
            RequestIp = ipAddress,
            UserAgent = userAgent,
            Language = dto.Language,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactFormSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Contact form submitted: ID={Id}, Name={FirstName} {LastName}", 
            submission.Id, submission.FirstName, submission.LastName);

        return MapToContactFormDto(submission);
    }

    public async Task<ContactFormDto?> GetContactFormByIdAsync(int id)
    {
        var form = await _context.ContactFormSubmissions.FindAsync(id);
        return form == null ? null : MapToContactFormDto(form);
    }

    public async Task<List<ContactFormDto>> GetAllContactFormsAsync()
    {
        var forms = await _context.ContactFormSubmissions
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return forms.Select(MapToContactFormDto).ToList();
    }

    public async Task<bool> UpdateContactFormStatusAsync(int id, string status, string? adminNotes = null)
    {
        var form = await _context.ContactFormSubmissions.FindAsync(id);
        if (form == null) return false;

        form.Status = status;
        form.AdminNotes = adminNotes;
        form.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Contact form status updated: ID={Id}, Status={Status}", id, status);
        return true;
    }

    private static ContactFormDto MapToContactFormDto(ContactFormSubmission entity)
    {
        return new ContactFormDto
        {
            Id = entity.Id,
            CreatedAt = entity.CreatedAt,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            Phone = entity.Phone,
            Age = entity.Age,
            Nationality = entity.Nationality,
            Education = entity.Education,
            FieldOfStudy = entity.FieldOfStudy,
            WorkExperience = entity.WorkExperience,
            GermanLevel = entity.GermanLevel,
            EnglishLevel = entity.EnglishLevel,
            Interest = entity.Interest,
            PreferredCity = entity.PreferredCity,
            Timeline = entity.Timeline,
            Message = entity.Message,
            PrivacyConsent = entity.PrivacyConsent,
            Newsletter = entity.Newsletter,
            Status = entity.Status,
            AdminNotes = entity.AdminNotes,
            UpdatedAt = entity.UpdatedAt
        };
    }

    #endregion
}

