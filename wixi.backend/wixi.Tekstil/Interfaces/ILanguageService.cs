using System.Collections.Generic;
using System.Threading.Tasks;
using wixi.Tekstil.DTOs;

namespace wixi.Tekstil.Interfaces
{
    public interface ILanguageService
    {
        Task<List<LanguageDto>> GetAllLanguagesAsync();
        Task<LanguageDto?> GetLanguageByIdAsync(int id);
        Task<LanguageDto?> GetLanguageByCodeAsync(string code);
        Task<LanguageDto> CreateLanguageAsync(CreateLanguageDto dto);
        Task<LanguageDto> UpdateLanguageAsync(int id, UpdateLanguageDto dto);
        Task<bool> DeleteLanguageAsync(int id);
        Task<LanguageDto?> GetDefaultLanguageAsync();
    }
}


