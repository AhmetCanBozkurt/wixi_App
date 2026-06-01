namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiNewsletterSubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = null!;
    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
