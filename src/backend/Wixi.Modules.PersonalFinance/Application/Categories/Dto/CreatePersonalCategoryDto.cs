using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Dto;

public class CreatePersonalCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public PersonalCategoryType Type { get; set; }

    [StringLength(7)]
    public string Color { get; set; } = "#6366f1";

    [StringLength(50)]
    public string Icon { get; set; } = "💰";
}
