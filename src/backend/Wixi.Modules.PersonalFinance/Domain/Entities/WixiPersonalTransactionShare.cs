using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalTransactionShare
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid TransactionId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    public decimal ShareAmount { get; set; }
    public decimal SharePercentage { get; set; }

    // Navigation
    public virtual WixiPersonalTransaction Transaction { get; set; } = null!;
}
