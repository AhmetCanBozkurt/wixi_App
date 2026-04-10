using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CategoryId { get; set; }

        // Varsayılan Dil (TR)
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ShortDescription { get; set; }

        // Dil-bağımsız
        [Required]
        [MaxLength(200)]
        public string Slug { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? SKU { get; set; }

        // Fiyatlandırma
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountPrice { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "TRY";

        public int MinOrderQuantity { get; set; } = 1;

        // Medya
        [MaxLength(500)]
        public string? PrimaryImageUrl { get; set; }

        [MaxLength(200)]
        public string? PrimaryImageAlt { get; set; }

        // Özellikler (JSON)
        public string? Features { get; set; }

        public string? Specifications { get; set; }

        // Stok
        public int StockQuantity { get; set; } = 0;

        public bool IsInStock { get; set; } = true;

        // Metadata
        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        public bool IsNew { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        public int ViewCount { get; set; } = 0;

        // SEO
        [MaxLength(200)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }

        [MaxLength(500)]
        public string? MetaKeywords { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int CreatedBy { get; set; }

        public int UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("CategoryId")]
        public virtual ProductCategory Category { get; set; } = null!;

        public virtual ICollection<ProductTranslation> Translations { get; set; } = new List<ProductTranslation>();

        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}


