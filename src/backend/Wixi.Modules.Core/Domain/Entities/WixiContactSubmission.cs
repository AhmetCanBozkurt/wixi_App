namespace Wixi.Modules.Core.Domain.Entities;

public class WixiContactSubmission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Topic { get; set; } = string.Empty;   // 'Genel', 'Satış', 'Destek', 'Basın'
    public string Message { get; set; } = string.Empty;
    public string Source { get; set; } = "landing-contact";
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
}
