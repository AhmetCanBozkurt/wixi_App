using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalRecurringTransaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    public Guid? HouseholdId { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required, StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public PersonalTransactionType Type { get; set; }
    public RecurrenceFrequency Frequency { get; set; }
    public DateTime NextDueDate { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiPersonalCategory Category { get; set; } = null!;
}
