namespace wixi.Email.DTOs;

public class EmailLogDto
{
    public long Id { get; set; }
    public Guid? CorrelationId { get; set; }
    public string FromEmail { get; set; } = string.Empty;
    public string? FromName { get; set; }
    public string ToEmails { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string Status { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public DateTime? LastAttemptAt { get; set; }
    public string? LastError { get; set; }
    public string? TemplateKey { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SendEmailDto
{
    public string ToEmail { get; set; } = string.Empty;
    public string? ToName { get; set; }
    public string? CcEmails { get; set; }
    public string? BccEmails { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string? BodyText { get; set; }
    public List<EmailAttachmentDto>? Attachments { get; set; }
}

public class SendTemplateEmailDto
{
    public string ToEmail { get; set; } = string.Empty;
    public string? ToName { get; set; }
    public string TemplateKey { get; set; } = string.Empty;
    public string Language { get; set; } = "TR";  // TR, EN, DE, AR
    public Dictionary<string, string> Placeholders { get; set; } = new();
}

public class EmailAttachmentDto
{
    public string FileName { get; set; } = string.Empty;
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "application/octet-stream";
}

