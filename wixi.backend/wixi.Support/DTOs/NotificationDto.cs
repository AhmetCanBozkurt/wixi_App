namespace wixi.Support.DTOs;

public class NotificationDto
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public string? RelatedEntityType { get; set; }
    public long? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public bool IsArchived { get; set; }
    public string Priority { get; set; } = string.Empty;
    public bool SentViaEmail { get; set; }
    public bool SentViaPush { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsExpired { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationDto
{
    public int UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public string? RelatedEntityType { get; set; }
    public long? RelatedEntityId { get; set; }
    public string? Priority { get; set; }
    public bool SendViaEmail { get; set; } = false;
    public bool SendViaPush { get; set; } = false;
    public DateTime? ExpiresAt { get; set; }
}

public class MarkNotificationReadDto
{
    public long NotificationId { get; set; }
    public bool IsRead { get; set; } = true;
}

