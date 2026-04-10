using wixi.Email.Entities;

namespace wixi.Email.Interfaces
{
    public interface ISmtpSettingsService
    {
        Task<SmtpSettings?> GetAsync();
        Task<SmtpSettings> UpsertAsync(SmtpSettings input, string? updatedBy = null);
        void InvalidateCache();
    }
}

