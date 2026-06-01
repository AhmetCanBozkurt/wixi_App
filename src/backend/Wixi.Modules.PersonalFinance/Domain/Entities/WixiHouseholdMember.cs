using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiHouseholdMember
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid HouseholdId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    public HouseholdRole Role { get; set; } = HouseholdRole.Member;
    public bool IsActive { get; set; } = true;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiHousehold Household { get; set; } = null!;
}
