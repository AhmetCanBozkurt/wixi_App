namespace wixi.Email.DTOs
{
    public class EmailMessage
    {
        public string? CorrelationId { get; set; }
        public Dictionary<string, string>? Metadata { get; set; }
        public string? FromEmail { get; set; }
        public string? FromName { get; set; }
        public List<string> To { get; set; } = new();
        public List<string>? Cc { get; set; }
        public List<string>? Bcc { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string? BodyHtml { get; set; }
        public string? BodyText { get; set; }
        public List<EmailAttachment>? Attachments { get; set; }
        /// <summary>
        /// Template key used to send this email (if sent via template)
        /// </summary>
        public string? TemplateKey { get; set; }
    }

    public class EmailAttachment
    {
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string? ContentType { get; set; }
    }
}

