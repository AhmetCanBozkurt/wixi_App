using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum CustomerNoteType { General = 0, Complaint = 1, Vip = 2, Followup = 3, Blacklist = 4 }

/// <summary>
/// CRM admin notu — store-admin kullanıcılarının müşteri kartına düştüğü notlar.
/// IsPrivate=true notlar hiçbir storefront endpoint'ine sızmaz.
/// </summary>
public class WixiCustomerNote : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public WixiCustomer? Customer { get; set; }

    public CustomerNoteType NoteType { get; set; } = CustomerNoteType.General;
    public string Content { get; set; } = string.Empty;
    public bool IsPrivate { get; set; } = true;

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
