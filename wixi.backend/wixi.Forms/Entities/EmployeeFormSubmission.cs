namespace wixi.Forms.Entities;

/// <summary>
/// Employee Form Submission - İş arayan başvuru formu
/// Used by job seekers to submit their applications with CV
/// </summary>
public class EmployeeFormSubmission
{
    public int Id { get; set; }
    
    /// <summary>
    /// When the form was submitted
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Personal Information
    /// <summary>
    /// Salutation (Mr., Mrs., Dr., etc.)
    /// </summary>
    public string? Salutation { get; set; }
    
    /// <summary>
    /// Full name of the applicant
    /// </summary>
    public string FullName { get; set; } = string.Empty;
    
    /// <summary>
    /// Contact email
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Contact phone
    /// </summary>
    public string Phone { get; set; } = string.Empty;
    
    // Qualifications
    /// <summary>
    /// Profession/Job title (e.g., "Software Engineer", "Nurse")
    /// </summary>
    public string? Profession { get; set; }
    
    /// <summary>
    /// Years of experience
    /// </summary>
    public int? Experience { get; set; }
    
    /// <summary>
    /// Education level (e.g., "Bachelor's", "Master's", "PhD")
    /// </summary>
    public string? Education { get; set; }
    
    /// <summary>
    /// German language level (A1, A2, B1, B2, C1, C2, Native)
    /// </summary>
    public string? GermanLevel { get; set; }
    
    /// <summary>
    /// Additional information about qualifications
    /// </summary>
    public string? AdditionalInfo { get; set; }
    
    // CV Upload
    /// <summary>
    /// Uploaded CV file name
    /// </summary>
    public string? CvFileName { get; set; }
    
    /// <summary>
    /// Uploaded CV file path on server
    /// </summary>
    public string? CvFilePath { get; set; }
    
    /// <summary>
    /// CV file size in bytes
    /// </summary>
    public long? CvFileSize { get; set; }
    
    // Additional
    /// <summary>
    /// Special requests or notes from applicant
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
    /// Processing status (Pending, Reviewed, Contacted, Rejected)
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

