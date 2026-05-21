using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public enum PortType
{
    Sea = 1,
    Air = 2,
    Road = 3,
    Rail = 4,
    MultiModal = 5
}

public class WixiPort : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UnLocode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string CountryCode { get; set; } = string.Empty;
    public string? CityName { get; set; }
    public PortType Type { get; set; } = PortType.Sea;
    public bool IsTurkish { get; set; }
    public int SortOrder { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
