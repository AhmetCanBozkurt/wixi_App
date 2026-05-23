using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.Finance.Domain.Entities;

public class WixiInstallmentDetail
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid InstallmentPlanId { get; set; }

    public int Month { get; set; }
    public int Year { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public bool PaidStatus { get; set; } = false;
    public DateTime? PaidAt { get; set; }

    // Navigation
    public virtual WixiInstallmentPlan InstallmentPlan { get; set; } = null!;
}
