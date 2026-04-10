using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class StatTranslation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StatId { get; set; }

        [Required]
        [MaxLength(10)]
        public string LanguageCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Label { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Value { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StatId")]
        public virtual Stat Stat { get; set; } = null!;

        [ForeignKey("LanguageCode")]
        public virtual Language Language { get; set; } = null!;
    }
}

