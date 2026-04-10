using wixi.Clients.Entities;
using wixi.Documents.Entities;
using wixi.Payments.Entities;

namespace wixi.CVBuilder.Entities;

/// <summary>
/// Represents CV data created by a client using CV Builder
/// </summary>
public class CVData
{
    public int Id { get; set; }
    
    // Relations
    public long PaymentId { get; set; }
    public virtual Payment Payment { get; set; } = null!;
    
    public int ClientId { get; set; }
    public virtual Client Client { get; set; } = null!;
    
    public long? DocumentId { get; set; }  // Reference to original CV document (optional)
    public virtual Document? Document { get; set; }
    
    // Session
    public Guid SessionId { get; set; }  // Unique session ID for CV Builder
    
    // CV Data (stored as JSON)
    public string PersonalInfo { get; set; } = string.Empty;  // JSON: { fullName, email, phone, location, summary }
    public string Experience { get; set; } = string.Empty;    // JSON: Array of experience items
    public string Education { get; set; } = string.Empty;     // JSON: Array of education items
    public string Skills { get; set; } = string.Empty;        // JSON: Array of skills
    public string Languages { get; set; } = string.Empty;     // JSON: Array of languages
    public string Certificates { get; set; } = string.Empty;  // JSON: Array of certificates
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

