using wixi.Email.DTOs;

namespace wixi.Email.Interfaces;

/// <summary>
/// Service interface for email operations
/// </summary>
public interface IEmailService
{
    // Send emails
    Task<long> SendEmailAsync(SendEmailDto dto);
    Task<long> SendTemplateEmailAsync(SendTemplateEmailDto dto);
    Task<List<long>> SendBulkEmailAsync(List<SendEmailDto> dtos);
    
    // Email logs
    Task<EmailLogDto?> GetEmailLogByIdAsync(long id);
    Task<IEnumerable<EmailLogDto>> GetEmailLogsByStatusAsync(string status);
    Task<IEnumerable<EmailLogDto>> GetEmailLogsByCorrelationIdAsync(Guid correlationId);
    Task<IEnumerable<EmailLogDto>> GetEmailLogsByTemplateKeyAsync(string templateKey);
    Task<bool> RetryFailedEmailAsync(long id);
    Task<int> RetryAllFailedEmailsAsync();
    
    // Email templates
    Task<EmailTemplateDto?> GetTemplateByIdAsync(int id);
    Task<EmailTemplateDto?> GetTemplateByKeyAsync(string key);
    Task<IEnumerable<EmailTemplateDto>> GetAllTemplatesAsync();
    Task<EmailTemplateDto> CreateTemplateAsync(CreateEmailTemplateDto dto);
    Task<EmailTemplateDto> UpdateTemplateAsync(int id, UpdateEmailTemplateDto dto);
    Task<bool> DeleteTemplateAsync(int id);
    
    // Template rendering
    Task<string> RenderTemplateAsync(string templateKey, string language, Dictionary<string, string> placeholders);
    
    // Statistics
    Task<int> GetQueuedCountAsync();
    Task<int> GetFailedCountAsync();
    Task<int> GetSentCountAsync();
    Task<Dictionary<string, int>> GetEmailCountByStatusAsync();
}

