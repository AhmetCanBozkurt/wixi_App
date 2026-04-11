namespace Wixi.Modules.Core.Application.UserManagement.Dto;

// Returns full details for rendering the tree
public class UserMenuNodeDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; } 
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; }
    public string Path { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public Dictionary<string, string> Titles { get; set; } = new();
}

// Basic struct for dragging/sync payload
public class UserMenuSyncDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public int SortOrder { get; set; }
}
