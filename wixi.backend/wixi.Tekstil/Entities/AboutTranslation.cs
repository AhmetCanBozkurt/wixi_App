using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class AboutTranslation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AboutId { get; set; }

        [Required]
        [MaxLength(10)]
        public string LanguageCode { get; set; } = string.Empty;

        // Çevrilmiş İçerikler
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        [MaxLength(200)]
        public string? MissionTitle { get; set; }

        public string? MissionDescription { get; set; }

        [MaxLength(200)]
        public string? VisionTitle { get; set; }

        public string? VisionDescription { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("AboutId")]
        public virtual About About { get; set; } = null!;

        [ForeignKey("LanguageCode")]
        public virtual Language Language { get; set; } = null!;
    }
}


