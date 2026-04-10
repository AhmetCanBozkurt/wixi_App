using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CategoryId { get; set; }

        // Varsayılan Dil (TR)
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ClientName { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Dil-bağımsız
        [Required]
        [MaxLength(200)]
        public string Slug { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? PrimaryImageUrl { get; set; }

        [MaxLength(200)]
        public string? PrimaryImageAlt { get; set; }

        // Proje Detayları
        [Required]
        public int Year { get; set; }

        public int? Quantity { get; set; }

        [MaxLength(100)]
        public string? Duration { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Budget { get; set; }

        public DateTime? CompletionDate { get; set; }

        // Metadata
        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        public int ViewCount { get; set; } = 0;

        // SEO
        [MaxLength(200)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int CreatedBy { get; set; }

        public int UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("CategoryId")]
        public virtual ProjectCategory Category { get; set; } = null!;

        public virtual ICollection<ProjectTranslation> Translations { get; set; } = new List<ProjectTranslation>();

        public virtual ICollection<ProjectImage> Images { get; set; } = new List<ProjectImage>();

        public virtual ICollection<ProjectTag> Tags { get; set; } = new List<ProjectTag>();
    }
}


