using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Domain.Entities;

public class WixiFinanceCategory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // null = system default (available to all tenants)
    public string? TenantId { get; set; }

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public FinanceCategoryType Type { get; set; } = FinanceCategoryType.Expense;

    [StringLength(7)]
    public string Color { get; set; } = "#6366f1";

    [StringLength(50)]
    public string Icon { get; set; } = "💰";

    public bool IsDefault { get; set; } = false;
    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual ICollection<WixiFinanceTransaction> Transactions { get; set; } = [];
    public virtual ICollection<WixiFinanceBudgetCategory> BudgetCategories { get; set; } = [];
    public virtual ICollection<WixiRecurringTransaction> RecurringTransactions { get; set; } = [];
}
