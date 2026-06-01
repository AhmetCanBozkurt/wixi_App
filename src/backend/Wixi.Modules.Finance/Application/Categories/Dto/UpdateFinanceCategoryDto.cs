using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Categories.Dto;

public class UpdateFinanceCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    public FinanceCategoryType? Type { get; set; }

    [StringLength(7)]
    public string? Color { get; set; }

    [StringLength(50)]
    public string? Icon { get; set; }
}
