using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalInstallmentPlan
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid TransactionId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Range(2, 120)]
    public int TotalCount { get; set; }

    public decimal MonthlyAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiPersonalTransaction Transaction { get; set; } = null!;
    public virtual ICollection<WixiPersonalInstallmentDetail> Details { get; set; } = [];
}
