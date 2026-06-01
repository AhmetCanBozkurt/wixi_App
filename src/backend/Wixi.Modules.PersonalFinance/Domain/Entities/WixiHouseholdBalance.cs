using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiHouseholdBalance
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid HouseholdId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    // + = alacaklı, - = borçlu
    public decimal NetBalance { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiHousehold Household { get; set; } = null!;
}
