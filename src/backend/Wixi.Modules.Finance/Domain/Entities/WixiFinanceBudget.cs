using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Domain.Entities;

public class WixiFinanceBudget
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string TenantId { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalAmount { get; set; }

    public FinanceBudgetStatus Status { get; set; } = FinanceBudgetStatus.Active;
    public FinanceBudgetPeriodType PeriodType { get; set; } = FinanceBudgetPeriodType.Monthly;
    public bool AutoRenew { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual ICollection<WixiFinanceBudgetCategory> Categories { get; set; } = [];
    public virtual ICollection<WixiFinanceTransaction> Transactions { get; set; } = [];
}
