using Wixi.Modules.Core.Domain.Entities;
using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.ReferenceData.Incoterm.Dto;

public class IncotermDto : AuditableDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public IncotermGroup Group { get; set; }
    public bool SellerPaysFreight { get; set; }
    public bool SellerPaysInsurance { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
