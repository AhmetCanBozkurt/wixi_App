namespace Wixi.Modules.Core.Application.Navigation.Dto;

public class MenuTranslationDto
{
    public Guid LanguageId { get; set; }
    public string Title { get; set; } = string.Empty;
}

public class MenuEditDto
{
    public Guid? Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? ParentId { get; set; }
    public string Path { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public List<MenuTranslationDto> Translations { get; set; } = new List<MenuTranslationDto>();
}
