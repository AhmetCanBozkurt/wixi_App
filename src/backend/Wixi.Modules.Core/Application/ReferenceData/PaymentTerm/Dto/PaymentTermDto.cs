using Wixi.Modules.Core.Domain.Entities;
using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Dto;

public class PaymentTermDto : AuditableDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public int DueDays { get; set; }
    public PaymentTermType Type { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
