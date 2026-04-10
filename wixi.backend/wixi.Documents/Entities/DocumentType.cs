namespace wixi.Documents.Entities;

/// <summary>
/// Represents types of documents required from clients
/// Multi-language support: TR, EN, DE, AR
/// </summary>
public class DocumentType
{
    public int Id { get; set; }
    
    /// <summary>
    /// Unique code for programmatic access (e.g., "passport", "diploma", "cv")
    /// </summary>
    public string Code { get; set; } = string.Empty;
    
    // Multi-language Names (4 languages: TR, EN, DE, AR)
    public string Name_TR { get; set; } = string.Empty;  // "Pasaport (Renkli Fotokopi - PDF)"
    public string Name_EN { get; set; } = string.Empty;  // "Passport (Color Copy - PDF)"
    public string Name_DE { get; set; } = string.Empty;  // "Reisepass (Farbkopie - PDF)"
    public string Name_AR { get; set; } = string.Empty;  // "جواز السفر (نسخة ملونة - PDF)"
    
    // Multi-language Descriptions (4 languages: TR, EN, DE, AR)
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    // Multi-language Notes (4 languages: TR, EN, DE, AR)
    // Example: "20€ ücret karşılığında Almanca CV hazırlama hizmeti"
    public string? Note_TR { get; set; }
    public string? Note_EN { get; set; }
    public string? Note_DE { get; set; }
    public string? Note_AR { get; set; }
    
    // Requirements
    public bool IsRequired { get; set; } = true;
    public bool IsActive { get; set; } = true;
    
    // Education type relationship (some documents are education-type specific)
    public int? EducationTypeId { get; set; }
    
    // Validation rules
    public string? AllowedFileTypes { get; set; }  // ".pdf,.jpg,.png"
    public long? MaxFileSizeBytes { get; set; }  // 10485760 (10MB)
    public bool RequiresApproval { get; set; } = true;
    
    // Display
    public int DisplayOrder { get; set; }
    public string? IconName { get; set; }
    
    // Relations
    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

