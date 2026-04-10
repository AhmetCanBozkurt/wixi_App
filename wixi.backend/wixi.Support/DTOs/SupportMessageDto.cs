namespace wixi.Support.DTOs;

public class SupportMessageDto
{
    public long Id { get; set; }
    public long TicketId { get; set; }
    public int SenderId { get; set; }
    public string? SenderName { get; set; }
    public string? SenderRole { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public bool IsFromClient { get; set; }
    public bool IsAutomated { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? AttachmentFileName { get; set; }
    public long? AttachmentSizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSupportMessageDto
{
    public long TicketId { get; set; }
    public int SenderId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsInternal { get; set; } = false;
    public bool IsFromClient { get; set; } = true;
    // Attachment will be handled separately via IFormFile
}

