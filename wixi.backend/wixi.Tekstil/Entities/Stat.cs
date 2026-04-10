using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class Stat
    {
        [Key]
        public int Id { get; set; }

        // Varsayılan Dil (TR)
        [Required]
        [MaxLength(100)]
        public string Label { get; set; } = string.Empty; // "Yıllık Deneyim"

        [Required]
        [MaxLength(50)]
        public string Value { get; set; } = string.Empty; // "15+"

        // Dil-bağımsız
        [Required]
        [MaxLength(50)]
        public string IconName { get; set; } = string.Empty; // "Award", "Users", "Sparkles", "Target"

        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<StatTranslation> Translations { get; set; } = new List<StatTranslation>();
    }
}


