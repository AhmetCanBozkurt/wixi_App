using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Identity.DTOs;
using wixi.Identity.Entities;
using wixi.Identity.Interfaces;

namespace wixi.WebAPI.Services;

public class TablePreferenceService : ITablePreferenceService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<TablePreferenceService> _logger;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public TablePreferenceService(
        WixiDbContext context,
        ILogger<TablePreferenceService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TablePreferenceDto?> GetAsync(int userId, string tableKey)
    {
        var entity = await _context.UserTablePreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.TableKey == tableKey);

        return entity == null ? null : MapToDto(entity);
    }

    public async Task<TablePreferenceDto> UpsertAsync(int userId, UpdateTablePreferenceDto dto)
    {
        var entity = await _context.UserTablePreferences
            .FirstOrDefaultAsync(x => x.UserId == userId && x.TableKey == dto.TableKey);

        if (entity == null)
        {
            entity = new UserTablePreference
            {
                UserId = userId,
                TableKey = dto.TableKey
            };
            _context.UserTablePreferences.Add(entity);
        }

        entity.VisibleColumns = Serialize(dto.VisibleColumns);
        entity.ColumnOrder = Serialize(dto.ColumnOrder);
        entity.ColumnFilters = Serialize(dto.ColumnFilters ?? new Dictionary<string, object>());
        entity.SortConfig = Serialize(dto.SortConfig ?? new SortConfigDto());
        entity.PageSize = dto.PageSize > 0 ? dto.PageSize : 20;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(entity);
    }

    private TablePreferenceDto MapToDto(UserTablePreference entity)
    {
        return new TablePreferenceDto
        {
            TableKey = entity.TableKey,
            VisibleColumns = Deserialize<List<string>>(entity.VisibleColumns) ?? new List<string>(),
            ColumnOrder = Deserialize<List<string>>(entity.ColumnOrder) ?? new List<string>(),
            ColumnFilters = Deserialize<Dictionary<string, object>>(entity.ColumnFilters),
            SortConfig = Deserialize<SortConfigDto>(entity.SortConfig),
            PageSize = entity.PageSize
        };
    }

    private string Serialize<T>(T value)
    {
        return JsonSerializer.Serialize(value ?? Activator.CreateInstance<T>(), _jsonOptions);
    }

    private T? Deserialize<T>(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return default;
        }

        try
        {
            return JsonSerializer.Deserialize<T>(json, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize table preference payload of type {Type}", typeof(T).Name);
            return default;
        }
    }
}

