using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class About
    {
        [Key]
        public int Id { get; set; }

        // Varsayılan Dil (TR) İçerikleri
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string MissionTitle { get; set; } = string.Empty;

        [Required]
        public string MissionDescription { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string VisionTitle { get; set; } = string.Empty;

        [Required]
        public string VisionDescription { get; set; } = string.Empty;

        // Metadata
        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; } = 0;

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int CreatedBy { get; set; }

        public int UpdatedBy { get; set; }

        // Navigation Properties
        public virtual ICollection<AboutTranslation> Translations { get; set; } = new List<AboutTranslation>();
    }
}


