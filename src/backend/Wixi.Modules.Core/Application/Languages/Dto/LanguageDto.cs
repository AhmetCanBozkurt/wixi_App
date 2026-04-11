namespace Wixi.Modules.Core.Application.Languages.Dto;

public class LanguageDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public string? FlagCode { get; set; }
    public bool IsActive { get; set; }
}
