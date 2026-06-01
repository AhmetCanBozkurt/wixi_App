using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalInstallmentDetail
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid InstallmentPlanId { get; set; }

    public int Month { get; set; }
    public int Year { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public bool PaidStatus { get; set; } = false;
    public DateTime? PaidAt { get; set; }

    // Navigation
    public virtual WixiPersonalInstallmentPlan InstallmentPlan { get; set; } = null!;
}
