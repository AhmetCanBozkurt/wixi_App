using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalBudget
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    public Guid? HouseholdId { get; set; }

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    public decimal TotalAmount { get; set; }

    public BudgetStatus Status { get; set; } = BudgetStatus.Active;
    public BudgetPeriodType PeriodType { get; set; } = BudgetPeriodType.Monthly;
    public bool AutoRenew { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual ICollection<WixiPersonalBudgetCategory> Categories { get; set; } = [];
    public virtual ICollection<WixiPersonalTransaction> Transactions { get; set; } = [];
}
