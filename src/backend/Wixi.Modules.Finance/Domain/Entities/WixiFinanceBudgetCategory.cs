using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.Finance.Domain.Entities;

public class WixiFinanceBudgetCategory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BudgetId { get; set; }
    public Guid CategoryId { get; set; }

    public decimal AllocatedAmount { get; set; }
    public decimal SpentAmount { get; set; }

    // Navigation
    public virtual WixiFinanceBudget Budget { get; set; } = null!;
    public virtual WixiFinanceCategory Category { get; set; } = null!;
}
