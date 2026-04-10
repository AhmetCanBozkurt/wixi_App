using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Entities;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Services.Tekstil
{
    public class LanguageService : ILanguageService
    {
        private readonly WixiDbContext _context;

        public LanguageService(WixiDbContext context)
        {
            _context = context;
        }

        public async Task<List<LanguageDto>> GetAllLanguagesAsync()
        {
            return await _context.TekstilLanguages
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new LanguageDto
                {
                    Id = l.Id,
                    Code = l.Code,
                    Name = l.Name,
                    NativeName = l.NativeName,
                    FlagIcon = l.FlagIcon,
                    IsDefault = l.IsDefault,
                    IsActive = l.IsActive,
                    DisplayOrder = l.DisplayOrder
                })
                .ToListAsync();
        }

        public async Task<LanguageDto?> GetLanguageByIdAsync(int id)
        {
            var language = await _context.TekstilLanguages.FindAsync(id);
            if (language == null) return null;

            return new LanguageDto
            {
                Id = language.Id,
                Code = language.Code,
                Name = language.Name,
                NativeName = language.NativeName,
                FlagIcon = language.FlagIcon,
                IsDefault = language.IsDefault,
                IsActive = language.IsActive,
                DisplayOrder = language.DisplayOrder
            };
        }

        public async Task<LanguageDto?> GetLanguageByCodeAsync(string code)
        {
            var language = await _context.TekstilLanguages
                .FirstOrDefaultAsync(l => l.Code == code);
            
            if (language == null) return null;

            return new LanguageDto
            {
                Id = language.Id,
                Code = language.Code,
                Name = language.Name,
                NativeName = language.NativeName,
                FlagIcon = language.FlagIcon,
                IsDefault = language.IsDefault,
                IsActive = language.IsActive,
                DisplayOrder = language.DisplayOrder
            };
        }

        public async Task<LanguageDto> CreateLanguageAsync(CreateLanguageDto dto)
        {
            // Check if language with same code already exists
            var existingLanguage = await _context.TekstilLanguages
                .FirstOrDefaultAsync(l => l.Code == dto.Code);
            
            if (existingLanguage != null)
            {
                throw new InvalidOperationException($"Language with code '{dto.Code}' already exists.");
            }

            var language = new Language
            {
                Code = dto.Code,
                Name = dto.Name,
                NativeName = dto.NativeName,
                FlagIcon = dto.FlagIcon,
                IsDefault = dto.IsDefault,
                IsActive = dto.IsActive,
                DisplayOrder = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // If this is set as default, unset other defaults
            if (dto.IsDefault)
            {
                var existingDefaults = await _context.TekstilLanguages
                    .Where(l => l.IsDefault)
                    .ToListAsync();
                
                foreach (var lang in existingDefaults)
                {
                    lang.IsDefault = false;
                }
            }

            _context.TekstilLanguages.Add(language);
            await _context.SaveChangesAsync();

            return new LanguageDto
            {
                Id = language.Id,
                Code = language.Code,
                Name = language.Name,
                NativeName = language.NativeName,
                FlagIcon = language.FlagIcon,
                IsDefault = language.IsDefault,
                IsActive = language.IsActive,
                DisplayOrder = language.DisplayOrder
            };
        }

        public async Task<LanguageDto> UpdateLanguageAsync(int id, UpdateLanguageDto dto)
        {
            var language = await _context.TekstilLanguages.FindAsync(id);
            if (language == null)
                throw new Exception("Language not found");

            language.Name = dto.Name;
            language.NativeName = dto.NativeName;
            language.FlagIcon = dto.FlagIcon;
            language.IsDefault = dto.IsDefault;
            language.IsActive = dto.IsActive;
            language.DisplayOrder = dto.DisplayOrder;
            language.UpdatedAt = DateTime.UtcNow;

            // If this is set as default, unset other defaults
            if (dto.IsDefault)
            {
                var existingDefaults = await _context.TekstilLanguages
                    .Where(l => l.IsDefault && l.Id != id)
                    .ToListAsync();
                
                foreach (var lang in existingDefaults)
                {
                    lang.IsDefault = false;
                }
            }

            await _context.SaveChangesAsync();

            return new LanguageDto
            {
                Id = language.Id,
                Code = language.Code,
                Name = language.Name,
                NativeName = language.NativeName,
                FlagIcon = language.FlagIcon,
                IsDefault = language.IsDefault,
                IsActive = language.IsActive,
                DisplayOrder = language.DisplayOrder
            };
        }

        public async Task<bool> DeleteLanguageAsync(int id)
        {
            var language = await _context.TekstilLanguages.FindAsync(id);
            if (language == null) return false;

            // Don't allow deleting default language
            if (language.IsDefault)
                throw new Exception("Cannot delete default language");

            _context.TekstilLanguages.Remove(language);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<LanguageDto?> GetDefaultLanguageAsync()
        {
            var language = await _context.TekstilLanguages
                .FirstOrDefaultAsync(l => l.IsDefault);
            
            if (language == null) return null;

            return new LanguageDto
            {
                Id = language.Id,
                Code = language.Code,
                Name = language.Name,
                NativeName = language.NativeName,
                FlagIcon = language.FlagIcon,
                IsDefault = language.IsDefault,
                IsActive = language.IsActive,
                DisplayOrder = language.DisplayOrder
            };
        }
    }
}


