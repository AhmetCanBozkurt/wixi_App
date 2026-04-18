using Wixi.Shared.Configuration;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiSmtpSetting : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Server { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;

    // Use this to determine which setting is the active default one, in case multiple are added over time.
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
}
