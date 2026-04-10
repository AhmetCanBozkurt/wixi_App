namespace wixi.Forms.Entities;

/// <summary>
/// Contact Form Submission - Genel iletişim formu
/// General contact form for inquiries and information requests
/// </summary>
public class ContactFormSubmission
{
    public int Id { get; set; }
    
    /// <summary>
    /// When the form was submitted
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Personal Information
    /// <summary>
    /// First name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>
    /// Last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>
    /// Contact email
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Contact phone
    /// </summary>
    public string Phone { get; set; } = string.Empty;
    
    /// <summary>
    /// Age (optional)
    /// </summary>
    public int? Age { get; set; }
    
    /// <summary>
    /// Nationality
    /// </summary>
    public string? Nationality { get; set; }
    
    // Education
    /// <summary>
    /// Education level (e.g., "High School", "Bachelor's", "Master's")
    /// </summary>
    public string? Education { get; set; }
    
    /// <summary>
    /// Field of study (e.g., "Computer Science", "Engineering")
    /// </summary>
    public string? FieldOfStudy { get; set; }
    
    /// <summary>
    /// Work experience description
    /// </summary>
    public string? WorkExperience { get; set; }
    
    // Languages
    /// <summary>
    /// German language level (A1, A2, B1, B2, C1, C2, Native)
    /// </summary>
    public string? GermanLevel { get; set; }
    
    /// <summary>
    /// English language level (A1, A2, B1, B2, C1, C2, Native)
    /// </summary>
    public string? EnglishLevel { get; set; }
    
    // Interest & Preferences
    /// <summary>
    /// Area of interest (e.g., "Work", "Study", "Both")
    /// </summary>
    public string? Interest { get; set; }
    
    /// <summary>
    /// Preferred city for work/study (e.g., "Berlin", "Munich", "Frankfurt")
    /// </summary>
    public string? PreferredCity { get; set; }
    
    /// <summary>
    /// Timeline for moving/starting (e.g., "Immediately", "In 3 months", "In 6 months")
    /// </summary>
    public string? Timeline { get; set; }
    
    // Additional
    /// <summary>
    /// Message/inquiry from the user
    /// </summary>
    public string? Message { get; set; }
    
    /// <summary>
    /// Privacy consent checkbox
    /// </summary>
    public bool PrivacyConsent { get; set; } = false;
    
    /// <summary>
    /// Newsletter subscription checkbox
    /// </summary>
    public bool Newsletter { get; set; } = false;
    
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
    /// Processing status (Pending, Responded, Closed)
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

