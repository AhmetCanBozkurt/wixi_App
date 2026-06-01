using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Dto;

public class PersonalCategoryDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public PersonalCategoryType Type { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsSystem { get; set; }
    public DateTime CreatedAt { get; set; }
}
