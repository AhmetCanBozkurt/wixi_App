using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiInvestmentValueCache
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(20)]
    public string AssetCode { get; set; } = string.Empty;

    public DateTime Date { get; set; }
    public decimal Price { get; set; }

    [StringLength(50)]
    public string Source { get; set; } = string.Empty;
}
