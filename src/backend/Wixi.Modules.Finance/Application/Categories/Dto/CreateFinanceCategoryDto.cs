using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Categories.Dto;

public class CreateFinanceCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public FinanceCategoryType Type { get; set; }

    [StringLength(7)]
    public string Color { get; set; } = "#6366f1";

    [StringLength(50)]
    public string Icon { get; set; } = "💰";
}
