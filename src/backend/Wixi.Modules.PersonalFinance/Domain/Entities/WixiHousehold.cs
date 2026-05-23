using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiHousehold
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(50)]
    public string Name { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Description { get; set; }

    public HouseholdType Type { get; set; } = HouseholdType.Family;

    [StringLength(3)]
    public string CurrencyCode { get; set; } = "TRY";

    [StringLength(7)]
    public string? Color { get; set; }

    [Required]
    public Guid CreatedBy { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual ICollection<WixiHouseholdMember> Members { get; set; } = [];
    public virtual ICollection<WixiPersonalTransaction> Transactions { get; set; } = [];
    public virtual ICollection<WixiPersonalBudget> Budgets { get; set; } = [];
    public virtual ICollection<WixiHouseholdBalance> Balances { get; set; } = [];
}
