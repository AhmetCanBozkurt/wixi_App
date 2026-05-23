using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiHouseholdInvitation
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid HouseholdId { get; set; }

    [Required, StringLength(256)]
    public string InvitedEmail { get; set; } = string.Empty;

    [Required]
    public Guid InvitedBy { get; set; }

    [Required, StringLength(100)]
    public string Token { get; set; } = Guid.NewGuid().ToString("N");

    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7);
    public DateTime? AcceptedAt { get; set; }
    public bool IsUsed { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual WixiHousehold Household { get; set; } = null!;
}
