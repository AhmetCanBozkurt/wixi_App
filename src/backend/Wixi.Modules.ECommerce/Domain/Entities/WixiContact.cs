using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum ContactType
{
    Supplier = 1,  // Tedarikçi
    Customer = 2,  // Müşteri (B2B)
    Dealer   = 3,  // Bayi
}

public class WixiContact : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public ContactType Type { get; set; } = ContactType.Supplier;
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? ContactPersonName { get; set; }
    public string? Notes { get; set; }
    /// <summary>Güncel bakiye (pozitif = alacak, negatif = borç).</summary>
    public decimal Balance { get; set; } = 0m;

    public ICollection<WixiCariLedger> LedgerEntries { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
