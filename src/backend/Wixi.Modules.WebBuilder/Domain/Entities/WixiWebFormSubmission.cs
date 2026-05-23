namespace Wixi.Modules.WebBuilder.Domain.Entities;

public class WixiWebFormSubmission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FormId { get; set; }
    public Guid TenantId { get; set; }
    public string? DataJson { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
