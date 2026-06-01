using Wixi.Modules.Core.Domain.Entities;
using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.ReferenceData.Port.Dto;

public class PortDto : AuditableDto
{
    public Guid Id { get; set; }
    public string UnLocode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string CountryCode { get; set; } = string.Empty;
    public string? CityName { get; set; }
    public PortType Type { get; set; }
    public bool IsTurkish { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
