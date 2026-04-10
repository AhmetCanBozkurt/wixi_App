namespace wixi.Clients.DTOs;

/// <summary>
/// DTO for client note
/// </summary>
public class ClientNoteDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public string CreatedByUserEmail { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; }
    public bool IsVisibleToClient { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new client note
/// </summary>
public class CreateClientNoteDto
{
    public int ClientId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsPinned { get; set; } = false;
    public bool IsVisibleToClient { get; set; } = false;
}

/// <summary>
/// DTO for updating an existing client note
/// </summary>
public class UpdateClientNoteDto
{
    public string? Content { get; set; }
    public bool? IsPinned { get; set; }
    public bool? IsVisibleToClient { get; set; }
}

