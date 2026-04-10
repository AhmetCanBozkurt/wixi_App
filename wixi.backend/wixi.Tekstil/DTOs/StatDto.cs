using System.Collections.Generic;

namespace wixi.Tekstil.DTOs
{
    public class StatDto
    {
        public int Id { get; set; }
        public string IconName { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public List<StatTranslationDto> Translations { get; set; } = new();
    }

    public class StatTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class CreateStatDto
    {
        public string IconName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public List<StatTranslationDto>? Translations { get; set; }
    }

    public class UpdateStatDto
    {
        public string IconName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public List<StatTranslationDto>? Translations { get; set; }
    }
}


