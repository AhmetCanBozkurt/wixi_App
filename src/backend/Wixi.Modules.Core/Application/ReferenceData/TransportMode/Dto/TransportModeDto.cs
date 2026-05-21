using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.ReferenceData.TransportMode.Dto;

public class TransportModeDto : AuditableDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Icon { get; set; }
    public string? ColorHex { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
