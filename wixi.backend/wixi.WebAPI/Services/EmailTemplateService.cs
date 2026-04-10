using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Email.Entities;
using wixi.Email.DTOs;
using wixi.Email.Interfaces;

namespace wixi.WebAPI.Services
{
    public class EmailTemplateService : IEmailTemplateService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<EmailTemplateService> _logger;

        public EmailTemplateService(WixiDbContext context, ILogger<EmailTemplateService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<EmailTemplateDto>> GetAllAsync()
        {
            var templates = await _context.EmailTemplates
                .OrderBy(t => t.Key)
                .ToListAsync();

            return templates.Select(t => MapToDto(t)).ToList();
        }

        public async Task<EmailTemplateDto?> GetByKeyAsync(string key)
        {
            var template = await _context.EmailTemplates
                .FirstOrDefaultAsync(t => t.Key == key);

            return template != null ? MapToDto(template) : null;
        }

        public async Task<EmailTemplateDto> UpsertAsync(EmailTemplateDto input, string? updatedBy = null)
        {
            EmailTemplate? existing = null;
            
            // If ID is provided, try to find by ID first (for updates)
            if (input.Id > 0)
            {
                existing = await _context.EmailTemplates.FindAsync(input.Id);
            }
            
            // If not found by ID, try to find by key
            if (existing == null)
            {
                existing = await _context.EmailTemplates
                    .FirstOrDefaultAsync(t => t.Key == input.Key);
            }

            if (existing == null)
            {
                // Check if key already exists (for new templates)
                var keyExists = await _context.EmailTemplates
                    .AnyAsync(t => t.Key == input.Key);
                if (keyExists)
                {
                    throw new InvalidOperationException($"Template with key '{input.Key}' already exists");
                }

                var newTemplate = new EmailTemplate
                {
                    Key = input.Key,
                    DisplayName_TR = input.DisplayName_TR,
                    DisplayName_EN = input.DisplayName_EN,
                    DisplayName_DE = input.DisplayName_DE,
                    DisplayName_AR = input.DisplayName_AR,
                    Subject_TR = input.Subject_TR,
                    Subject_EN = input.Subject_EN,
                    Subject_DE = input.Subject_DE,
                    Subject_AR = input.Subject_AR,
                    BodyHtml_TR = input.BodyHtml_TR,
                    BodyHtml_EN = input.BodyHtml_EN,
                    BodyHtml_DE = input.BodyHtml_DE,
                    BodyHtml_AR = input.BodyHtml_AR,
                    Description = input.Description,
                    IsActive = input.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = updatedBy
                };
                _context.EmailTemplates.Add(newTemplate);
            }
            else
            {
                // If key is being changed, check if new key already exists
                if (existing.Key != input.Key)
                {
                    var keyExists = await _context.EmailTemplates
                        .AnyAsync(t => t.Key == input.Key && t.Id != existing.Id);
                    if (keyExists)
                    {
                        throw new InvalidOperationException($"Template with key '{input.Key}' already exists");
                    }
                }

                // Update all fields including key
                existing.Key = input.Key;
                existing.DisplayName_TR = input.DisplayName_TR;
                existing.DisplayName_EN = input.DisplayName_EN;
                existing.DisplayName_DE = input.DisplayName_DE;
                existing.DisplayName_AR = input.DisplayName_AR;
                existing.Subject_TR = input.Subject_TR;
                existing.Subject_EN = input.Subject_EN;
                existing.Subject_DE = input.Subject_DE;
                existing.Subject_AR = input.Subject_AR;
                existing.BodyHtml_TR = input.BodyHtml_TR;
                existing.BodyHtml_EN = input.BodyHtml_EN;
                existing.BodyHtml_DE = input.BodyHtml_DE;
                existing.BodyHtml_AR = input.BodyHtml_AR;
                existing.Description = input.Description;
                existing.IsActive = input.IsActive;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = updatedBy;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Email template upserted: {Key} (Id: {Id})", input.Key, input.Id);

            return await GetByKeyAsync(input.Key) ?? input;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var template = await _context.EmailTemplates.FindAsync(id);
            if (template == null)
                return false;

            _context.EmailTemplates.Remove(template);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Email template deleted: {Id}", id);
            return true;
        }

        private EmailTemplateDto MapToDto(EmailTemplate template)
        {
            return new EmailTemplateDto
            {
                Id = template.Id,
                Key = template.Key,
                DisplayName_TR = template.DisplayName_TR,
                DisplayName_EN = template.DisplayName_EN,
                DisplayName_DE = template.DisplayName_DE,
                DisplayName_AR = template.DisplayName_AR,
                Subject_TR = template.Subject_TR,
                Subject_EN = template.Subject_EN,
                Subject_DE = template.Subject_DE,
                Subject_AR = template.Subject_AR,
                BodyHtml_TR = template.BodyHtml_TR,
                BodyHtml_EN = template.BodyHtml_EN,
                BodyHtml_DE = template.BodyHtml_DE,
                BodyHtml_AR = template.BodyHtml_AR,
                Description = template.Description,
                IsActive = template.IsActive,
                UpdatedAt = template.UpdatedAt
            };
        }
    }
}

