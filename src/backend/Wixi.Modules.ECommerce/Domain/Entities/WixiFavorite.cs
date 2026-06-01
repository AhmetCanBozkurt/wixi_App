namespace Wixi.Modules.ECommerce.Domain.Entities;

public class WixiFavorite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
