using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.WebBuilder.Domain.Entities;

public class WixiWebForm : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? FieldsJson { get; set; } // Form alan tanımları JSON
    public string SubmitButtonText { get; set; } = "Gönder";
    public string? SuccessMessage { get; set; }
    public string? NotifyEmail { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
