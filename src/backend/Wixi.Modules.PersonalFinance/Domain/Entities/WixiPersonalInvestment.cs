using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalInvestment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    public AssetType AssetType { get; set; }

    [Required, StringLength(20)]
    public string AssetCode { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string AssetName { get; set; } = string.Empty;

    public decimal Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public DateTime PurchaseDate { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
