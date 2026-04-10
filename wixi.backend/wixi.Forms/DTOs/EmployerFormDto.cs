namespace wixi.Forms.DTOs;

/// <summary>
/// DTO for submitting employer form
/// </summary>
public class SubmitEmployerFormDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? CompanySize { get; set; }
    public string Positions { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string? SpecialRequests { get; set; }
    public string? Language { get; set; }
}

/// <summary>
/// DTO for employer form response
/// </summary>
public class EmployerFormDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? CompanySize { get; set; }
    public string Positions { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string? SpecialRequests { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNotes { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? EmailLogId { get; set; }
}

