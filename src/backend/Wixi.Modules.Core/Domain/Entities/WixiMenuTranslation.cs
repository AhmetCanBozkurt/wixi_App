using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiMenuTranslation : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MenuId { get; set; }
    public Guid LanguageId { get; set; }
    public string Title { get; set; } = string.Empty;

    // Navigation
    public virtual WixiMenu Menu { get; set; } = null!;
    public virtual WixiLanguage Language { get; set; } = null!;

    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
