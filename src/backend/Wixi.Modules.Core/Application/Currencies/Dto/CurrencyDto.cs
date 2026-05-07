using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.Currencies.Dto;

public class CurrencyDto : AuditableDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Symbol { get; set; }
    public int Unit { get; set; }
    public bool IsBase { get; set; }
    public bool IsTcmbTracked { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
