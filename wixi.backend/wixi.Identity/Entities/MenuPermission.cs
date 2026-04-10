namespace wixi.Identity.Entities;

public class MenuPermission
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string MenuPath { get; set; } = string.Empty;
    public string MenuText { get; set; } = string.Empty;
    public string? MenuCategory { get; set; }
    public string? MenuIcon { get; set; }
    public bool IsVisible { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation property
    public User? User { get; set; }
}

