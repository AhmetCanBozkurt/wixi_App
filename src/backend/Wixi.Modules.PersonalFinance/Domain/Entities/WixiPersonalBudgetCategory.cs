using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalBudgetCategory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid BudgetId { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    public decimal AllocatedAmount { get; set; }
    public decimal SpentAmount { get; set; }

    // Navigation
    public virtual WixiPersonalBudget Budget { get; set; } = null!;
    public virtual WixiPersonalCategory Category { get; set; } = null!;
}
