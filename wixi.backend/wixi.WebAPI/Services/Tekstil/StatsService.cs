using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Entities;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Services.Tekstil
{
    public class StatsService : IStatsService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<StatsService> _logger;

        public StatsService(WixiDbContext context, ILogger<StatsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<StatDto>> GetAllStatsAsync(string? languageCode = null)
        {
            var stats = await _context.TekstilStats
                .Include(s => s.Translations)
                .OrderBy(s => s.DisplayOrder)
                .ToListAsync();

            return stats.Select(s => MapToDto(s, languageCode)).ToList();
        }

        public async Task<List<StatDto>> GetActiveStatsAsync(string? languageCode = null)
        {
            var stats = await _context.TekstilStats
                .Include(s => s.Translations)
                .Where(s => s.IsActive)
                .OrderBy(s => s.DisplayOrder)
                .ToListAsync();

            return stats.Select(s => MapToDto(s, languageCode)).ToList();
        }

        public async Task<StatDto?> GetStatByIdAsync(int id, string? languageCode = null)
        {
            var stat = await _context.TekstilStats
                .Include(s => s.Translations)
                .FirstOrDefaultAsync(s => s.Id == id);

            return stat == null ? null : MapToDto(stat, languageCode);
        }

        public async Task<StatDto> CreateStatAsync(CreateStatDto dto)
        {
            var stat = new Stat
            {
                IconName = dto.IconName,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TekstilStats.Add(stat);
            await _context.SaveChangesAsync();

            // Add translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var translation = new StatTranslation
                    {
                        StatId = stat.Id,
                        LanguageCode = trans.LanguageCode,
                        Label = trans.Label,
                        Value = trans.Value,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilStatTranslations.Add(translation);
                }
                await _context.SaveChangesAsync();
            }

            return (await GetStatByIdAsync(stat.Id))!;
        }

        public async Task<StatDto> UpdateStatAsync(int id, UpdateStatDto dto)
        {
            var stat = await _context.TekstilStats
                .Include(s => s.Translations)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (stat == null)
                throw new KeyNotFoundException($"Stat with ID {id} not found");

            stat.IconName = dto.IconName;
            stat.DisplayOrder = dto.DisplayOrder;
            stat.IsActive = dto.IsActive;
            stat.UpdatedAt = DateTime.UtcNow;

            // Update translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var existingTrans = stat.Translations
                        .FirstOrDefault(t => t.LanguageCode == trans.LanguageCode);

                    if (existingTrans != null)
                    {
                        existingTrans.Label = trans.Label;
                        existingTrans.Value = trans.Value;
                        existingTrans.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        var newTrans = new StatTranslation
                        {
                            StatId = stat.Id,
                            LanguageCode = trans.LanguageCode,
                            Label = trans.Label,
                            Value = trans.Value,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.TekstilStatTranslations.Add(newTrans);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return (await GetStatByIdAsync(stat.Id))!;
        }

        public async Task<bool> DeleteStatAsync(int id)
        {
            var stat = await _context.TekstilStats.FindAsync(id);
            if (stat == null)
                return false;

            _context.TekstilStats.Remove(stat);
            await _context.SaveChangesAsync();
            return true;
        }

        private StatDto MapToDto(Stat stat, string? languageCode = null)
        {
            var dto = new StatDto
            {
                Id = stat.Id,
                IconName = stat.IconName,
                Label = "",
                Value = "",
                DisplayOrder = stat.DisplayOrder,
                IsActive = stat.IsActive,
                Translations = stat.Translations?.Select(t => new StatTranslationDto
                {
                    LanguageCode = t.LanguageCode,
                    Label = t.Label,
                    Value = t.Value
                }).ToList() ?? new List<StatTranslationDto>()
            };

            // Use translation if language code is specified
            if (!string.IsNullOrEmpty(languageCode))
            {
                var translation = stat.Translations?.FirstOrDefault(t => t.LanguageCode == languageCode);
                if (translation != null)
                {
                    dto.Label = translation.Label;
                    dto.Value = translation.Value;
                }
            }
            else
            {
                // Use first translation as default
                var firstTrans = stat.Translations?.FirstOrDefault();
                if (firstTrans != null)
                {
                    dto.Label = firstTrans.Label;
                    dto.Value = firstTrans.Value;
                }
            }

            return dto;
        }
    }
}

