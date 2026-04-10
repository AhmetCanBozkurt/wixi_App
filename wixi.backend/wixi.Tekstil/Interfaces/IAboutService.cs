using System.Collections.Generic;
using System.Threading.Tasks;
using wixi.Tekstil.DTOs;

namespace wixi.Tekstil.Interfaces
{
    public interface IAboutService
    {
        Task<List<AboutDto>> GetAllAboutAsync(string? languageCode = null);
        Task<AboutDto?> GetAboutByIdAsync(int id, string? languageCode = null);
        Task<AboutDto> CreateAboutAsync(CreateAboutDto dto);
        Task<AboutDto> UpdateAboutAsync(int id, UpdateAboutDto dto);
        Task<bool> DeleteAboutAsync(int id);
        Task<AboutDto?> GetActiveAboutAsync(string? languageCode = null);
    }
}


