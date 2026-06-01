using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiHouseholdPayment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid HouseholdId { get; set; }

    [Required]
    public Guid PayerUserId { get; set; }

    [Required]
    public Guid PayeeUserId { get; set; }

    public decimal Amount { get; set; }

    [StringLength(200)]
    public string? Note { get; set; }

    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    public Guid? ConfirmedBy { get; set; }
    public DateTime? ConfirmedAt { get; set; }

    // Navigation
    public virtual WixiHousehold Household { get; set; } = null!;
}
