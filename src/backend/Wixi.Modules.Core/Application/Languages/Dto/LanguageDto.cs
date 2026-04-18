using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.Languages.Dto;

public class LanguageDto : AuditableDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public string? FlagCode { get; set; }
    public string? IconBase64 { get; set; }
    public bool IsActive { get; set; }
}
