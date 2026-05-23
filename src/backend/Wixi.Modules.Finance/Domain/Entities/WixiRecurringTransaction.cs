using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Domain.Entities;

public class WixiRecurringTransaction
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string TenantId { get; set; } = string.Empty;

    public Guid CategoryId { get; set; }

    public decimal Amount { get; set; }

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public FinanceTransactionType Type { get; set; }
    public FinanceRecurrenceFrequency Frequency { get; set; }
    public DateTime NextDueDate { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiFinanceCategory? Category { get; set; }
}
