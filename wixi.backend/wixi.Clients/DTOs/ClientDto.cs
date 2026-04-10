namespace wixi.Clients.DTOs;

/// <summary>
/// Base client data transfer object
/// </summary>
public class ClientDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserEmail { get; set; }
    public string ClientCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public int? Age { get; set; }
    public string? Nationality { get; set; }
    public string? PassportNumber { get; set; }
    public int? EducationTypeId { get; set; }
    public string? EducationTypeName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public List<EducationInfoDto> EducationHistory { get; set; } = new();
}

/// <summary>
/// DTO for creating a new client
/// </summary>
public class CreateClientDto
{
    public int UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Nationality { get; set; }
    public string? PassportNumber { get; set; }
    public int? EducationTypeId { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for updating an existing client
/// </summary>
public class UpdateClientDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Nationality { get; set; }
    public string? PassportNumber { get; set; }
    public int? EducationTypeId { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for client profile response with education info
/// </summary>
public class ClientProfileDto : ClientDto
{
    public List<EducationInfoDto> EducationInfos { get; set; } = new();
}

