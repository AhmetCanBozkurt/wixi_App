using System.Collections.Generic;
using System.Threading.Tasks;
using wixi.Tekstil.DTOs;

namespace wixi.Tekstil.Interfaces
{
    public interface IStatsService
    {
        Task<List<StatDto>> GetAllStatsAsync(string? languageCode = null);
        Task<StatDto?> GetStatByIdAsync(int id, string? languageCode = null);
        Task<StatDto> CreateStatAsync(CreateStatDto dto);
        Task<StatDto> UpdateStatAsync(int id, UpdateStatDto dto);
        Task<bool> DeleteStatAsync(int id);
        Task<List<StatDto>> GetActiveStatsAsync(string? languageCode = null);
    }
}


