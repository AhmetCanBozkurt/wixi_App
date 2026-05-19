using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiModuleMenu : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ModuleId { get; set; }
    public virtual WixiModule? Module { get; set; }
    
    public Guid? ParentId { get; set; }
    public virtual WixiModuleMenu? Parent { get; set; }
    
    public string Path { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public int SortOrder { get; set; }
    
    /// <summary>Müşteri (Tenant) panelinde görünebilir mi?</summary>
    public bool VisibleToTenant { get; set; } = true;
    
    public virtual ICollection<WixiModuleMenu> Children { get; set; } = new List<WixiModuleMenu>();
    public virtual ICollection<WixiModuleMenuTranslation> Translations { get; set; } = new List<WixiModuleMenuTranslation>();

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}

public class WixiModuleMenuTranslation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ModuleMenuId { get; set; }
    public Guid LanguageId { get; set; }
    public string Title { get; set; } = string.Empty;
    
    public virtual WixiModuleMenu? ModuleMenu { get; set; }
    public virtual WixiLanguage? Language { get; set; }
}
