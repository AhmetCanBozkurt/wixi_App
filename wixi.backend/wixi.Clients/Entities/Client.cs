namespace wixi.Clients.Entities;

/// <summary>
/// Represents a client in the system
/// </summary>
public class Client
{
    public int Id { get; set; }
    
    /// <summary>
    /// Foreign key to User (from Identity module)
    /// </summary>
    public int UserId { get; set; }
    
    // Personal Info
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    
    public DateTime? DateOfBirth { get; set; }
    public string? Nationality { get; set; }
    public string? PassportNumber { get; set; }
    
    // Client-specific
    public string ClientCode { get; set; } = string.Empty;  // WP-84321
    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
    public ClientStatus Status { get; set; } = ClientStatus.Active;
    
    /// <summary>
    /// Education type ID (University, Vocational School, Apprenticeship)
    /// </summary>
    public int? EducationTypeId { get; set; }
    
    public string? ProfilePictureUrl { get; set; }
    public string? Notes { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }  // Soft delete
    public DateTime? LastActivityAt { get; set; }
    
    // Navigation properties
    public virtual EducationType? EducationType { get; set; }
    public virtual ICollection<EducationInfo> EducationInfos { get; set; } = new List<EducationInfo>();
    
    // Computed properties
    public string FullName => $"{FirstName} {LastName}";
    public bool IsActive => Status == ClientStatus.Active && DeletedAt == null;
}

public enum ClientStatus
{
    Active = 1,
    Inactive = 2,
    Suspended = 3,
    Completed = 4
}

