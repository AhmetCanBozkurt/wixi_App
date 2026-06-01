namespace Wixi.Modules.Core.Domain.Entities;

public class WixiCity
{
    public int Id { get; set; }
    public int StateId { get; set; }
    public int CountryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsActive { get; set; } = true;

    public WixiState? State { get; set; }
    public WixiCountry? Country { get; set; }
}
