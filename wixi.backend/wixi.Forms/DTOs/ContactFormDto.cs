namespace wixi.Forms.DTOs;

/// <summary>
/// DTO for submitting contact form
/// </summary>
public class SubmitContactFormDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int? Age { get; set; }
    public string? Nationality { get; set; }
    public string? Education { get; set; }
    public string? FieldOfStudy { get; set; }
    public string? WorkExperience { get; set; }
    public string? GermanLevel { get; set; }
    public string? EnglishLevel { get; set; }
    public string? Interest { get; set; }
    public string? PreferredCity { get; set; }
    public string? Timeline { get; set; }
    public string? Message { get; set; }
    public bool PrivacyConsent { get; set; }
    public bool Newsletter { get; set; }
    public string? Language { get; set; }
}

/// <summary>
/// DTO for contact form response
/// </summary>
public class ContactFormDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int? Age { get; set; }
    public string? Nationality { get; set; }
    public string? Education { get; set; }
    public string? FieldOfStudy { get; set; }
    public string? WorkExperience { get; set; }
    public string? GermanLevel { get; set; }
    public string? EnglishLevel { get; set; }
    public string? Interest { get; set; }
    public string? PreferredCity { get; set; }
    public string? Timeline { get; set; }
    public string? Message { get; set; }
    public bool PrivacyConsent { get; set; }
    public bool Newsletter { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNotes { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

