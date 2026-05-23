using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.Finance.Domain.Entities;

public class WixiInstallmentPlan
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string TenantId { get; set; } = string.Empty;

    public Guid TransactionId { get; set; }

    public DateTime StartDate { get; set; }

    /// <summary>Total number of installments (2–120).</summary>
    public int TotalCount { get; set; }

    public decimal MonthlyAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiFinanceTransaction Transaction { get; set; } = null!;
    public virtual ICollection<WixiInstallmentDetail> Details { get; set; } = [];
}
