namespace wixi.Identity.DTOs;

public class MenuPermissionDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string MenuPath { get; set; } = string.Empty;
    public string MenuText { get; set; } = string.Empty;
    public string? MenuCategory { get; set; }
    public string? MenuIcon { get; set; }
    public bool IsVisible { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateMenuPermissionDto
{
    public int UserId { get; set; }
    public string MenuPath { get; set; } = string.Empty;
    public string MenuText { get; set; } = string.Empty;
    public string? MenuCategory { get; set; }
    public string? MenuIcon { get; set; }
    public bool IsVisible { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateMenuPermissionDto
{
    public string? MenuText { get; set; }
    public string? MenuCategory { get; set; }
    public string? MenuIcon { get; set; }
    public bool? IsVisible { get; set; }
    public int? DisplayOrder { get; set; }
}

public class MenuPermissionByUserDto
{
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public List<MenuPermissionDto> MenuItems { get; set; } = new();
}

public class BulkUpdateMenuPermissionsDto
{
    public int UserId { get; set; }
    public List<MenuPermissionItemDto> MenuItems { get; set; } = new();
}

public class MenuPermissionItemDto
{
    public string MenuPath { get; set; } = string.Empty;
    public string MenuText { get; set; } = string.Empty;
    public string? MenuCategory { get; set; }
    public string? MenuIcon { get; set; }
    public bool IsVisible { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

