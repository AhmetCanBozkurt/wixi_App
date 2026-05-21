using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public enum IncotermGroup
{
    AnyMode = 1,
    SeaInland = 2
}

public class WixiIncoterm : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public IncotermGroup Group { get; set; } = IncotermGroup.AnyMode;
    public bool SellerPaysFreight { get; set; }
    public bool SellerPaysInsurance { get; set; }
    public int SortOrder { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
