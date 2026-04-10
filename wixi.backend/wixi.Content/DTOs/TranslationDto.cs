namespace wixi.Content.DTOs
{
    public class TranslationDto
    {
        public long Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string? De { get; set; }
        public string? Tr { get; set; }
        public string? En { get; set; }
        public string? Ar { get; set; }
    }
}

