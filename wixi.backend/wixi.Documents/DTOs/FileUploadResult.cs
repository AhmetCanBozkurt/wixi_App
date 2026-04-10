namespace wixi.Documents.DTOs
{
    public class FileUploadResult
    {
        public bool Success { get; set; }
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
        public string? StoredFileName { get; set; }
        public long FileSizeBytes { get; set; }
        public string? FileExtension { get; set; }
        public string? MimeType { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class FileValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}

