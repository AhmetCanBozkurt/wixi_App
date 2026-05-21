using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Dto;

public class TaxOfficeDto : AuditableDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? CityName { get; set; }
    public string? CountryCode { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
