using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class ProductCategory
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
        public string? IconName { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int? ParentCategoryId { get; set; }

        // Metadata
        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

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
        [ForeignKey("ParentCategoryId")]
        public virtual ProductCategory? ParentCategory { get; set; }

        public virtual ICollection<ProductCategory> SubCategories { get; set; } = new List<ProductCategory>();

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();

        public virtual ICollection<ProductCategoryTranslation> Translations { get; set; } = new List<ProductCategoryTranslation>();
    }
}


