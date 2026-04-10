using wixi.Identity.DTOs;

namespace wixi.Identity.Interfaces;

public interface ITablePreferenceService
{
    Task<TablePreferenceDto?> GetAsync(int userId, string tableKey);
    Task<TablePreferenceDto> UpsertAsync(int userId, UpdateTablePreferenceDto dto);
}

