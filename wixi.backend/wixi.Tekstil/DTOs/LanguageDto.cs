namespace wixi.Tekstil.DTOs
{
    public class LanguageDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string NativeName { get; set; } = string.Empty;
        public string? FlagIcon { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateLanguageDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string NativeName { get; set; } = string.Empty;
        public string? FlagIcon { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; }
    }

    public class UpdateLanguageDto
    {
        public string Name { get; set; } = string.Empty;
        public string NativeName { get; set; } = string.Empty;
        public string? FlagIcon { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }
}


