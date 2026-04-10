using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Identity.DTOs;
using wixi.Identity.Entities;
using wixi.Identity.Interfaces;

namespace wixi.WebAPI.Services;

public class MenuPermissionService : IMenuPermissionService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<MenuPermissionService> _logger;

    public MenuPermissionService(
        WixiDbContext context,
        ILogger<MenuPermissionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<MenuPermissionDto>> GetAllMenuPermissionsAsync()
    {
        return await _context.MenuPermissions
            .Include(mp => mp.User)
            .OrderBy(mp => mp.UserId)
            .ThenBy(mp => mp.DisplayOrder)
            .Select(mp => new MenuPermissionDto
            {
                Id = mp.Id,
                UserId = mp.UserId,
                UserName = mp.User != null ? $"{mp.User.FirstName} {mp.User.LastName}".Trim() : null,
                UserEmail = mp.User != null ? mp.User.Email : null,
                MenuPath = mp.MenuPath,
                MenuText = mp.MenuText,
                MenuCategory = mp.MenuCategory,
                MenuIcon = mp.MenuIcon,
                IsVisible = mp.IsVisible,
                DisplayOrder = mp.DisplayOrder,
                CreatedAt = mp.CreatedAt,
                UpdatedAt = mp.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<MenuPermissionDto>> GetMenuPermissionsByUserIdAsync(int userId)
    {
        return await _context.MenuPermissions
            .Include(mp => mp.User)
            .Where(mp => mp.UserId == userId)
            .OrderBy(mp => mp.DisplayOrder)
            .Select(mp => new MenuPermissionDto
            {
                Id = mp.Id,
                UserId = mp.UserId,
                UserName = mp.User != null ? $"{mp.User.FirstName} {mp.User.LastName}".Trim() : null,
                UserEmail = mp.User != null ? mp.User.Email : null,
                MenuPath = mp.MenuPath,
                MenuText = mp.MenuText,
                MenuCategory = mp.MenuCategory,
                MenuIcon = mp.MenuIcon,
                IsVisible = mp.IsVisible,
                DisplayOrder = mp.DisplayOrder,
                CreatedAt = mp.CreatedAt,
                UpdatedAt = mp.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<MenuPermissionByUserDto>> GetMenuPermissionsGroupedByUserAsync()
    {
        var permissions = await _context.MenuPermissions
            .Include(mp => mp.User)
            .OrderBy(mp => mp.UserId)
            .ThenBy(mp => mp.DisplayOrder)
            .ToListAsync();

        return permissions
            .GroupBy(mp => mp.UserId)
            .Select(g => new MenuPermissionByUserDto
            {
                UserId = g.Key,
                UserName = g.First().User != null ? $"{g.First().User.FirstName} {g.First().User.LastName}".Trim() : null,
                UserEmail = g.First().User != null ? g.First().User.Email : null,
                MenuItems = g.Select(mp => new MenuPermissionDto
                {
                    Id = mp.Id,
                    UserId = mp.UserId,
                    UserName = mp.User != null ? $"{mp.User.FirstName} {mp.User.LastName}".Trim() : null,
                    UserEmail = mp.User != null ? mp.User.Email : null,
                    MenuPath = mp.MenuPath,
                    MenuText = mp.MenuText,
                    MenuCategory = mp.MenuCategory,
                    MenuIcon = mp.MenuIcon,
                    IsVisible = mp.IsVisible,
                    DisplayOrder = mp.DisplayOrder,
                    CreatedAt = mp.CreatedAt,
                    UpdatedAt = mp.UpdatedAt
                }).ToList()
            })
            .ToList();
    }

    public async Task<List<MenuPermissionDto>> GetVisibleMenusForUserAsync(int userId)
    {
        return await _context.MenuPermissions
            .Include(mp => mp.User)
            .Where(mp => mp.UserId == userId && mp.IsVisible)
            .OrderBy(mp => mp.DisplayOrder)
            .Select(mp => new MenuPermissionDto
            {
                Id = mp.Id,
                UserId = mp.UserId,
                UserName = mp.User != null ? $"{mp.User.FirstName} {mp.User.LastName}".Trim() : null,
                UserEmail = mp.User != null ? mp.User.Email : null,
                MenuPath = mp.MenuPath,
                MenuText = mp.MenuText,
                MenuCategory = mp.MenuCategory,
                MenuIcon = mp.MenuIcon,
                IsVisible = mp.IsVisible,
                DisplayOrder = mp.DisplayOrder,
                CreatedAt = mp.CreatedAt,
                UpdatedAt = mp.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<MenuPermissionDto?> GetMenuPermissionByIdAsync(int id)
    {
        var permission = await _context.MenuPermissions
            .Include(mp => mp.User)
            .FirstOrDefaultAsync(mp => mp.Id == id);

        if (permission == null)
            return null;

        return new MenuPermissionDto
        {
            Id = permission.Id,
            UserId = permission.UserId,
            UserName = permission.User != null ? $"{permission.User.FirstName} {permission.User.LastName}".Trim() : null,
            UserEmail = permission.User != null ? permission.User.Email : null,
            MenuPath = permission.MenuPath,
            MenuText = permission.MenuText,
            MenuCategory = permission.MenuCategory,
            MenuIcon = permission.MenuIcon,
            IsVisible = permission.IsVisible,
            DisplayOrder = permission.DisplayOrder,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt
        };
    }

    public async Task<MenuPermissionDto> CreateMenuPermissionAsync(CreateMenuPermissionDto dto)
    {
        // Check if user exists
        var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            throw new Exception("User not found");

        // Check if permission already exists
        var existing = await _context.MenuPermissions
            .FirstOrDefaultAsync(mp => mp.UserId == dto.UserId && mp.MenuPath == dto.MenuPath);

        if (existing != null)
            throw new Exception("Menu permission already exists for this user and path");

        var permission = new MenuPermission
        {
            UserId = dto.UserId,
            MenuPath = dto.MenuPath,
            MenuText = dto.MenuText,
            MenuCategory = dto.MenuCategory,
            MenuIcon = dto.MenuIcon,
            IsVisible = dto.IsVisible,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        _context.MenuPermissions.Add(permission);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Menu permission created. Id: {Id}, UserId: {UserId}, MenuPath: {MenuPath}",
            permission.Id, permission.UserId, permission.MenuPath);

        return await GetMenuPermissionByIdAsync(permission.Id) ?? throw new Exception("Failed to retrieve created permission");
    }

    public async Task<MenuPermissionDto> UpdateMenuPermissionAsync(int id, UpdateMenuPermissionDto dto)
    {
        var permission = await _context.MenuPermissions.FindAsync(id);
        if (permission == null)
            throw new Exception("Menu permission not found");

        if (dto.MenuText != null)
            permission.MenuText = dto.MenuText;
        if (dto.MenuCategory != null)
            permission.MenuCategory = dto.MenuCategory;
        if (dto.MenuIcon != null)
            permission.MenuIcon = dto.MenuIcon;
        if (dto.IsVisible.HasValue)
            permission.IsVisible = dto.IsVisible.Value;
        if (dto.DisplayOrder.HasValue)
            permission.DisplayOrder = dto.DisplayOrder.Value;
        
        permission.UpdatedAt = DateTime.UtcNow;

        _context.MenuPermissions.Update(permission);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Menu permission updated. Id: {Id}, UserId: {UserId}, MenuPath: {MenuPath}",
            permission.Id, permission.UserId, permission.MenuPath);

        return await GetMenuPermissionByIdAsync(permission.Id) ?? throw new Exception("Failed to retrieve updated permission");
    }

    public async Task<bool> DeleteMenuPermissionAsync(int id)
    {
        var permission = await _context.MenuPermissions.FindAsync(id);
        if (permission == null)
            return false;

        _context.MenuPermissions.Remove(permission);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Menu permission deleted. Id: {Id}, UserId: {UserId}, MenuPath: {MenuPath}",
            permission.Id, permission.UserId, permission.MenuPath);

        return true;
    }

    public async Task<bool> BulkUpdateMenuPermissionsAsync(BulkUpdateMenuPermissionsDto dto)
    {
        // Check if user exists
        var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            throw new Exception("User not found");

        // Get existing permissions for this user
        var existingPermissions = await _context.MenuPermissions
            .Where(mp => mp.UserId == dto.UserId)
            .ToListAsync();

        // Delete permissions that are not in the new list
        var newPaths = dto.MenuItems.Select(mi => mi.MenuPath).ToHashSet();
        var toDelete = existingPermissions.Where(ep => !newPaths.Contains(ep.MenuPath)).ToList();
        _context.MenuPermissions.RemoveRange(toDelete);

        // Update or create permissions
        foreach (var menuItem in dto.MenuItems)
        {
            var existing = existingPermissions.FirstOrDefault(ep => ep.MenuPath == menuItem.MenuPath);
            
            if (existing != null)
            {
                // Update existing
                existing.MenuText = menuItem.MenuText;
                existing.MenuCategory = menuItem.MenuCategory;
                existing.MenuIcon = menuItem.MenuIcon;
                existing.IsVisible = menuItem.IsVisible;
                existing.DisplayOrder = menuItem.DisplayOrder;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.MenuPermissions.Update(existing);
            }
            else
            {
                // Create new
                var newPermission = new MenuPermission
                {
                    UserId = dto.UserId,
                    MenuPath = menuItem.MenuPath,
                    MenuText = menuItem.MenuText,
                    MenuCategory = menuItem.MenuCategory,
                    MenuIcon = menuItem.MenuIcon,
                    IsVisible = menuItem.IsVisible,
                    DisplayOrder = menuItem.DisplayOrder,
                    CreatedAt = DateTime.UtcNow
                };
                _context.MenuPermissions.Add(newPermission);
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Bulk menu permissions updated. UserId: {UserId}, Count: {Count}",
            dto.UserId, dto.MenuItems.Count);

        return true;
    }

    public async Task<bool> InitializeDefaultMenuPermissionsForUserAsync(int userId)
    {
        // Check if user exists
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw new Exception("User not found");

        // Check if permissions already exist
        var hasPermissions = await _context.MenuPermissions.AnyAsync(mp => mp.UserId == userId);
        if (hasPermissions)
            return false; // Already initialized

        // Default menu items - can be customized based on user role
        var defaultMenus = new List<MenuPermissionItemDto>
        {
            new() { MenuPath = "/admin", MenuText = "Dashboard", MenuCategory = "Ana Menü", IsVisible = true, DisplayOrder = 1 },
            new() { MenuPath = "/admin/reports", MenuText = "Raporlar", MenuCategory = "Ana Menü", IsVisible = true, DisplayOrder = 2 },
            new() { MenuPath = "/admin/roles", MenuText = "Kullanıcılar ve Rol Yönetimi", MenuCategory = "Ana Menü", IsVisible = true, DisplayOrder = 3 },
        };

        var bulkDto = new BulkUpdateMenuPermissionsDto
        {
            UserId = userId,
            MenuItems = defaultMenus
        };

        return await BulkUpdateMenuPermissionsAsync(bulkDto);
    }
}

