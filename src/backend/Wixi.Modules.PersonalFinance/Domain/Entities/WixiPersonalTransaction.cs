using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalTransaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    // null ise kişisel işlem, doluysa household ortak işlem
    public Guid? HouseholdId { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    public Guid? BudgetId { get; set; }

    public Guid? InstallmentPlanId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required, StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public PersonalTransactionType Type { get; set; }

    // JSON string — etiketler
    public string? Tags { get; set; }

    public bool IsInstallment { get; set; } = false;

    // Household işleminde paylaşım türü
    public SharingType? SharingType { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiPersonalCategory Category { get; set; } = null!;
    public virtual WixiPersonalBudget? Budget { get; set; }
    public virtual WixiHousehold? Household { get; set; }
    public virtual WixiPersonalInstallmentPlan? InstallmentPlan { get; set; }
    public virtual ICollection<WixiPersonalTransactionShare> Shares { get; set; } = [];
}
