using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public enum HsCodeLevel
{
    Section = 1,   // Bölüm (2 digit: 01-97)
    Chapter = 2,   // Fasıl (4 digit: 0101)
    Heading = 3,   // Pozisyon (6 digit: 010110)
    Subheading = 4 // Alt Pozisyon (8 digit: 01011010)
}

public class WixiHsCode : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public HsCodeLevel Level { get; set; } = HsCodeLevel.Section;
    public Guid? ParentId { get; set; }
    public int SortOrder { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    public WixiHsCode? Parent { get; set; }
    public ICollection<WixiHsCode> Children { get; set; } = [];
}
