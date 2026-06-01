using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public enum PaymentTermType
{
    Advance = 1,
    Net = 2,
    DocumentaryCredit = 3,
    DocumentaryCollection = 4
}

public class WixiPaymentTerm : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public int DueDays { get; set; }
    public PaymentTermType Type { get; set; } = PaymentTermType.Net;
    public string? Description { get; set; }
    public int SortOrder { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
