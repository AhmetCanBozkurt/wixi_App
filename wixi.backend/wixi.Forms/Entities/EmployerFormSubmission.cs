namespace wixi.Forms.Entities;

/// <summary>
/// Employer Form Submission - İşveren başvuru formu
/// Used by companies to submit job postings and requirements
/// </summary>
public class EmployerFormSubmission
{
    public int Id { get; set; }
    
    /// <summary>
    /// When the form was submitted
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Company Information
    /// <summary>
    /// Company name
    /// </summary>
    public string CompanyName { get; set; } = string.Empty;
    
    /// <summary>
    /// Contact person name
    /// </summary>
    public string ContactPerson { get; set; } = string.Empty;
    
    /// <summary>
    /// Contact email
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Contact phone
    /// </summary>
    public string Phone { get; set; } = string.Empty;
    
    /// <summary>
    /// Industry/Sector (e.g., "Technology", "Healthcare")
    /// </summary>
    public string Industry { get; set; } = string.Empty;
    
    /// <summary>
    /// Company size (e.g., "1-10", "11-50", "51-200", "200+")
    /// </summary>
    public string? CompanySize { get; set; }
    
    // Position Requirements
    /// <summary>
    /// Job positions being offered (e.g., "Software Engineer, Product Manager")
    /// </summary>
    public string Positions { get; set; } = string.Empty;
    
    /// <summary>
    /// Position requirements and qualifications
    /// </summary>
    public string Requirements { get; set; } = string.Empty;
    
    // Additional Information
    /// <summary>
    /// Additional message from employer
    /// </summary>
    public string? Message { get; set; }
    
    /// <summary>
    /// Special requests or notes
    /// </summary>
    public string? SpecialRequests { get; set; }
    
    // Metadata
    /// <summary>
    /// IP address of the submitter
    /// </summary>
    public string? RequestIp { get; set; }
    
    /// <summary>
    /// User agent (browser info)
    /// </summary>
    public string? UserAgent { get; set; }
    
    /// <summary>
    /// Language used when submitting (de, tr, en, ar)
    /// </summary>
    public string? Language { get; set; }
    
    // Email Log Reference
    /// <summary>
    /// Reference to the email log when notification was sent
    /// </summary>
    public int? EmailLogId { get; set; }
    
    /// <summary>
    /// Processing status (Pending, Contacted, Closed)
    /// </summary>
    public string Status { get; set; } = "Pending";
    
    /// <summary>
    /// Admin notes for internal use
    /// </summary>
    public string? AdminNotes { get; set; }
    
    /// <summary>
    /// When the submission was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}

