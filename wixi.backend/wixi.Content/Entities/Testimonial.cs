using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Content.Entities
{
    [Table("wixi_Testimonials")]
    public class Testimonial
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Role { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(200)]
        public string? Company { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? ContentDe { get; set; }
        public string? ContentEn { get; set; }
        public string? ContentAr { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }
    }
}

