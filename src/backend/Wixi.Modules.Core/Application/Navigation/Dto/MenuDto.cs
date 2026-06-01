namespace Wixi.Modules.Core.Application.Navigation.Dto;

public class MenuDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public int SortOrder { get; set; }
    public Guid? ParentId { get; set; }
    public List<MenuDto> Children { get; set; } = new List<MenuDto>();
}
