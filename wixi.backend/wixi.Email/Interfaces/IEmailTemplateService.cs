using wixi.Email.DTOs;

namespace wixi.Email.Interfaces
{
    public interface IEmailTemplateService
    {
        Task<List<EmailTemplateDto>> GetAllAsync();
        Task<EmailTemplateDto?> GetByKeyAsync(string key);
        Task<EmailTemplateDto> UpsertAsync(EmailTemplateDto input, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}

