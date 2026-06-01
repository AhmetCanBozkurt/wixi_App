namespace Wixi.Modules.Core.Application.ReferenceData.Unit.Dto;

public class UnitDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Symbol { get; set; }
    public Guid? UnitCategoryId { get; set; }
    public string? CategoryName { get; set; }
    public bool IsBaseUnit { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
}
