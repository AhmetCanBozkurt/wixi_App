using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Domain.Entities;

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

    // A customer can have multiple addresses, orders, etc.
    public ICollection<WixiAddress> Addresses { get; set; } = [];
    // public ICollection<WixiOrder> Orders { get; set; } = new List<WixiOrder>();
    
    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
