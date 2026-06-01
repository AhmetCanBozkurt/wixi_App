using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Domain.Entities;

public class WixiFinanceTransaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string TenantId { get; set; } = string.Empty;

    [Required]
    public Guid CategoryId { get; set; }

    public Guid? BudgetId { get; set; }
    public Guid? InstallmentPlanId { get; set; }

    public decimal Amount { get; set; }

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public DateTime Date { get; set; }
    public FinanceTransactionType Type { get; set; } = FinanceTransactionType.Expense;

    // JSON array of tags
    public string? Tags { get; set; }

    public bool IsInstallment { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiFinanceCategory? Category { get; set; }
    public virtual WixiFinanceBudget? Budget { get; set; }
    public virtual WixiInstallmentPlan? InstallmentPlan { get; set; }
}
