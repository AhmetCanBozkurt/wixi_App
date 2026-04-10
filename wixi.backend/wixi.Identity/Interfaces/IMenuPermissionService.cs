using wixi.Identity.DTOs;

namespace wixi.Identity.Interfaces;

public interface IMenuPermissionService
{
    Task<List<MenuPermissionDto>> GetAllMenuPermissionsAsync();
    Task<List<MenuPermissionDto>> GetMenuPermissionsByUserIdAsync(int userId);
    Task<List<MenuPermissionByUserDto>> GetMenuPermissionsGroupedByUserAsync();
    Task<List<MenuPermissionDto>> GetVisibleMenusForUserAsync(int userId);
    Task<MenuPermissionDto?> GetMenuPermissionByIdAsync(int id);
    Task<MenuPermissionDto> CreateMenuPermissionAsync(CreateMenuPermissionDto dto);
    Task<MenuPermissionDto> UpdateMenuPermissionAsync(int id, UpdateMenuPermissionDto dto);
    Task<bool> DeleteMenuPermissionAsync(int id);
    Task<bool> BulkUpdateMenuPermissionsAsync(BulkUpdateMenuPermissionsDto dto);
    Task<bool> InitializeDefaultMenuPermissionsForUserAsync(int userId);
}

