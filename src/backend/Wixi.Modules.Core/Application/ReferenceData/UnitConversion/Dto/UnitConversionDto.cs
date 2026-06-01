namespace Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Dto;

public class UnitConversionDto
{
    public Guid Id { get; set; }
    public Guid FromUnitId { get; set; }
    public string? FromUnitName { get; set; }
    public string? FromUnitSymbol { get; set; }
    public Guid ToUnitId { get; set; }
    public string? ToUnitName { get; set; }
    public string? ToUnitSymbol { get; set; }
    public decimal Factor { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
}
