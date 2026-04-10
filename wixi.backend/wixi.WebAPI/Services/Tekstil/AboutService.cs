using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Entities;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Services.Tekstil
{
    public class AboutService : IAboutService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<AboutService> _logger;

        public AboutService(WixiDbContext context, ILogger<AboutService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<AboutDto>> GetAllAboutAsync(string? languageCode = null)
        {
            var query = _context.TekstilAbout
                .Include(a => a.Translations)
                .OrderBy(a => a.DisplayOrder)
                .AsQueryable();

            var abouts = await query.ToListAsync();
            return abouts.Select(a => MapToDto(a, languageCode)).ToList();
        }

        public async Task<AboutDto?> GetAboutByIdAsync(int id, string? languageCode = null)
        {
            var about = await _context.TekstilAbout
                .Include(a => a.Translations)
                .FirstOrDefaultAsync(a => a.Id == id);

            return about == null ? null : MapToDto(about, languageCode);
        }

        public async Task<AboutDto?> GetActiveAboutAsync(string? languageCode = null)
        {
            var about = await _context.TekstilAbout
                .Include(a => a.Translations)
                .Where(a => a.IsActive)
                .OrderBy(a => a.DisplayOrder)
                .FirstOrDefaultAsync();

            return about == null ? null : MapToDto(about, languageCode);
        }

        public async Task<AboutDto> CreateAboutAsync(CreateAboutDto dto)
        {
            var about = new About
            {
                Title = dto.Title,
                Description = dto.Description,
                MissionTitle = dto.MissionTitle,
                MissionDescription = dto.MissionDescription,
                VisionTitle = dto.VisionTitle,
                VisionDescription = dto.VisionDescription,
                IsActive = dto.IsActive,
                DisplayOrder = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = dto.CreatedBy,
                UpdatedBy = dto.CreatedBy
            };

            _context.TekstilAbout.Add(about);
            await _context.SaveChangesAsync();

            // Add translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var translation = new AboutTranslation
                    {
                        AboutId = about.Id,
                        LanguageCode = trans.LanguageCode,
                        Title = trans.Title,
                        Description = trans.Description,
                        MissionTitle = trans.MissionTitle,
                        MissionDescription = trans.MissionDescription,
                        VisionTitle = trans.VisionTitle,
                        VisionDescription = trans.VisionDescription,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilAboutTranslations.Add(translation);
                }
                await _context.SaveChangesAsync();
            }

            return (await GetAboutByIdAsync(about.Id))!;
        }

        public async Task<AboutDto> UpdateAboutAsync(int id, UpdateAboutDto dto)
        {
            var about = await _context.TekstilAbout
                .Include(a => a.Translations)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (about == null)
                throw new KeyNotFoundException($"About with ID {id} not found");

            about.Title = dto.Title;
            about.Description = dto.Description;
            about.MissionTitle = dto.MissionTitle;
            about.MissionDescription = dto.MissionDescription;
            about.VisionTitle = dto.VisionTitle;
            about.VisionDescription = dto.VisionDescription;
            about.IsActive = dto.IsActive;
            about.DisplayOrder = dto.DisplayOrder;
            about.UpdatedAt = DateTime.UtcNow;
            about.UpdatedBy = dto.UpdatedBy;

            // Update translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var existingTrans = about.Translations
                        .FirstOrDefault(t => t.LanguageCode == trans.LanguageCode);

                    if (existingTrans != null)
                    {
                        existingTrans.Title = trans.Title;
                        existingTrans.Description = trans.Description;
                        existingTrans.MissionTitle = trans.MissionTitle;
                        existingTrans.MissionDescription = trans.MissionDescription;
                        existingTrans.VisionTitle = trans.VisionTitle;
                        existingTrans.VisionDescription = trans.VisionDescription;
                        existingTrans.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        var newTrans = new AboutTranslation
                        {
                            AboutId = about.Id,
                            LanguageCode = trans.LanguageCode,
                            Title = trans.Title,
                            Description = trans.Description,
                            MissionTitle = trans.MissionTitle,
                            MissionDescription = trans.MissionDescription,
                            VisionTitle = trans.VisionTitle,
                            VisionDescription = trans.VisionDescription,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.TekstilAboutTranslations.Add(newTrans);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return (await GetAboutByIdAsync(about.Id))!;
        }

        public async Task<bool> DeleteAboutAsync(int id)
        {
            var about = await _context.TekstilAbout.FindAsync(id);
            if (about == null)
                return false;

            _context.TekstilAbout.Remove(about);
            await _context.SaveChangesAsync();
            return true;
        }

        private AboutDto MapToDto(About about, string? languageCode = null)
        {
            var dto = new AboutDto
            {
                Id = about.Id,
                Title = about.Title,
                Description = about.Description,
                MissionTitle = about.MissionTitle,
                MissionDescription = about.MissionDescription,
                VisionTitle = about.VisionTitle,
                VisionDescription = about.VisionDescription,
                IsActive = about.IsActive,
                DisplayOrder = about.DisplayOrder,
                Translations = about.Translations?.Select(t => new AboutTranslationDto
                {
                    LanguageCode = t.LanguageCode,
                    Title = t.Title,
                    Description = t.Description,
                    MissionTitle = t.MissionTitle,
                    MissionDescription = t.MissionDescription,
                    VisionTitle = t.VisionTitle,
                    VisionDescription = t.VisionDescription
                }).ToList() ?? new List<AboutTranslationDto>()
            };

            // If language code is specified, use translation
            if (!string.IsNullOrEmpty(languageCode))
            {
                var translation = about.Translations?.FirstOrDefault(t => t.LanguageCode == languageCode);
                if (translation != null)
                {
                    dto.Title = translation.Title;
                    dto.Description = translation.Description;
                    dto.MissionTitle = translation.MissionTitle;
                    dto.MissionDescription = translation.MissionDescription;
                    dto.VisionTitle = translation.VisionTitle;
                    dto.VisionDescription = translation.VisionDescription;
                }
            }

            return dto;
        }
    }
}

