using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class ProjectCategory
    {
        [Key]
        public int Id { get; set; }

        // Varsayılan Dil (TR)
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        // Dil-bağımsız
        [Required]
        [MaxLength(100)]
        public string Slug { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Color { get; set; } // Badge rengi: "#3B82F6"

        [MaxLength(50)]
        public string? IconName { get; set; }

        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

        public virtual ICollection<ProjectCategoryTranslation> Translations { get; set; } = new List<ProjectCategoryTranslation>();
    }
}


