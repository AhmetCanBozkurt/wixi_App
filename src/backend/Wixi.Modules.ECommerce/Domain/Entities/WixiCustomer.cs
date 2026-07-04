using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

public enum CustomerGender { Unspecified = 0, Male = 1, Female = 2, Other = 3 }

/// <summary>
/// Represents an end-user (shopper) registered to a specific Tenant's Storefront.
/// This entity is isolated within the Tenant's specific database.
/// </summary>
public class WixiCustomer : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsEmailVerified { get; set; } = false;

    // ── CRM: kimlik / profil (M02) ─────────────────────────────
    public DateTime? BirthDate { get; set; }
    public CustomerGender Gender { get; set; } = CustomerGender.Unspecified;
    public string? ProfileImagePath { get; set; }   // D-02: relativePath, tam URL değil
    public bool IsPhoneVerified { get; set; } = false;
    public bool IsGuest { get; set; } = false;

    // ── CRM: KVKK / izin yönetimi ──────────────────────────────
    public bool EmailOptIn { get; set; } = false;
    public bool SmsOptIn { get; set; } = false;
    public bool PushOptIn { get; set; } = false;
    public DateTime? KvkkConsentDate { get; set; }

    // ── CRM: segmentasyon (RFM worker'ı tarafından güncellenir) ─
    public string? RfmSegment { get; set; }
    public decimal LtvAmount { get; set; } = 0;
    public int TotalOrders { get; set; } = 0;
    public DateTime? LastOrderDate { get; set; }

    // ── CRM: durum ─────────────────────────────────────────────
    public bool IsBlacklisted { get; set; } = false;
    public string? BlacklistReason { get; set; }

    // A customer can have multiple addresses, orders, etc.
    public ICollection<WixiAddress> Addresses { get; set; } = [];
    public ICollection<WixiCustomerNote> Notes { get; set; } = [];
    // public ICollection<WixiOrder> Orders { get; set; } = new List<WixiOrder>();
    
    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
