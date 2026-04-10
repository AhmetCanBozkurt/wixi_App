using System.Collections.Generic;

namespace wixi.Tekstil.DTOs
{
    public class AboutDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MissionTitle { get; set; } = string.Empty;
        public string MissionDescription { get; set; } = string.Empty;
        public string VisionTitle { get; set; } = string.Empty;
        public string VisionDescription { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public List<AboutTranslationDto> Translations { get; set; } = new();
    }

    public class AboutTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? MissionTitle { get; set; }
        public string? MissionDescription { get; set; }
        public string? VisionTitle { get; set; }
        public string? VisionDescription { get; set; }
    }

    public class AboutWithTranslationsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MissionTitle { get; set; } = string.Empty;
        public string MissionDescription { get; set; } = string.Empty;
        public string VisionTitle { get; set; } = string.Empty;
        public string VisionDescription { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public List<AboutTranslationDto> Translations { get; set; } = new();
    }

    public class CreateAboutDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MissionTitle { get; set; } = string.Empty;
        public string MissionDescription { get; set; } = string.Empty;
        public string VisionTitle { get; set; } = string.Empty;
        public string VisionDescription { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; }
        public int CreatedBy { get; set; }
        public List<AboutTranslationDto>? Translations { get; set; }
    }

    public class UpdateAboutDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MissionTitle { get; set; } = string.Empty;
        public string MissionDescription { get; set; } = string.Empty;
        public string VisionTitle { get; set; } = string.Empty;
        public string VisionDescription { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public int UpdatedBy { get; set; }
        public List<AboutTranslationDto>? Translations { get; set; }
    }
}

