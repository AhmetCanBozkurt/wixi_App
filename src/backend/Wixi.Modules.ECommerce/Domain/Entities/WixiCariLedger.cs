using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum LedgerEntryType
{
    Debit  = 1,  // Borç (alacağımız)
    Credit = 2,  // Alacak (borcumuz / ödeme)
}

public class WixiCariLedger : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ContactId { get; set; }
    public WixiContact? Contact { get; set; }
    public LedgerEntryType EntryType { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? ReferenceNo { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    /// <summary>Bu hareketten sonraki kümülatif bakiye anlık görüntüsü.</summary>
    public decimal BalanceAfter { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
