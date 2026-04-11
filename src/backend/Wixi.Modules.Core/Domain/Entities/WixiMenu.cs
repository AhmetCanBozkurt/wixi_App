using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiMenu : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // User Context
    public Guid UserId { get; set; }
    public virtual WixiUser? User { get; set; }

    public Guid? ParentId { get; set; }
    public string Path { get; set; } = string.Empty;
    public string? Icon { get; set; } // örn: "FaTh", "FaListAlt"
    public string? IconColor { get; set; } // örn: "#7c3aed", "blue"
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    
    // Navigation
    public virtual WixiMenu? Parent { get; set; }
    public virtual ICollection<WixiMenu> Children { get; set; } = new List<WixiMenu>();
    public virtual ICollection<WixiMenuTranslation> Translations { get; set; } = new List<WixiMenuTranslation>();

    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
