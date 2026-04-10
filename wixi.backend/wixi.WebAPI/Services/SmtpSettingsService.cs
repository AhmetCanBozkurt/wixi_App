using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using wixi.DataAccess;
using wixi.Email.Entities;
using wixi.Email.DTOs;
using wixi.Email.Interfaces;

namespace wixi.WebAPI.Services
{
    public class SmtpSettingsService : ISmtpSettingsService
    {
        private const string CacheKey = "smtp_settings_cache";
        private readonly WixiDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<SmtpSettingsService> _logger;

        public SmtpSettingsService(WixiDbContext context, IMemoryCache cache, ILogger<SmtpSettingsService> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        public async Task<SmtpSettings?> GetAsync()
        {
            if (_cache.TryGetValue(CacheKey, out SmtpSettings? cached))
                return cached;

            var settings = await _context.SmtpSettings.AsNoTracking().FirstOrDefaultAsync();
            if (settings != null)
            {
                _cache.Set(CacheKey, settings, TimeSpan.FromMinutes(5));
            }
            return settings;
        }

        public async Task<SmtpSettings> UpsertAsync(SmtpSettings input, string? updatedBy = null)
        {
            var existing = await _context.SmtpSettings.FirstOrDefaultAsync();
            if (existing == null)
            {
                input.PasswordEnc = input.PasswordEnc ?? string.Empty;
                input.UpdatedAt = DateTime.UtcNow;
                input.UpdatedBy = updatedBy;
                _context.SmtpSettings.Add(input);
            }
            else
            {
                existing.Host = input.Host;
                existing.Port = input.Port;
                existing.UseSsl = input.UseSsl;
                existing.UserName = input.UserName;
                if (!string.IsNullOrWhiteSpace(input.PasswordEnc))
                {
                    existing.PasswordEnc = input.PasswordEnc;
                }
                existing.FromName = input.FromName;
                existing.FromEmail = input.FromEmail;
                existing.TimeoutMs = input.TimeoutMs;
                existing.RetryCount = input.RetryCount;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = updatedBy;
            }

            await _context.SaveChangesAsync();
            InvalidateCache();
            _logger.LogInformation("SMTP settings updated");

            return (await GetAsync())!;
        }

        public void InvalidateCache() => _cache.Remove(CacheKey);
    }
}

