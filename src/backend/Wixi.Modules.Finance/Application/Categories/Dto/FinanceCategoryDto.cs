using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Categories.Dto;

public class FinanceCategoryDto
{
    public Guid Id { get; set; }
    public string? TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public FinanceCategoryType Type { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsSystem => TenantId == null;
    public DateTime CreatedAt { get; set; }
}
