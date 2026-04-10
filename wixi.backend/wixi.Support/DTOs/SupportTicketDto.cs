namespace wixi.Support.DTOs;

public class SupportTicketDto
{
    public long Id { get; set; }
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? Resolution { get; set; }
    public int? Rating { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<SupportMessageDto>? Messages { get; set; }
}

public class CreateSupportTicketDto
{
    public int ClientId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string InitialMessage { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Priority { get; set; }
}

public class UpdateSupportTicketDto
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public int? AssignedToId { get; set; }
    public string? Resolution { get; set; }
    public string? CloseReason { get; set; }
}

public class RateSupportTicketDto
{
    public int Rating { get; set; }  // 1-5
    public string? Comment { get; set; }
}

