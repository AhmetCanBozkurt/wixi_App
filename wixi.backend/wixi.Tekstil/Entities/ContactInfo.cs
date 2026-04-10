using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class ContactInfo
    {
        [Key]
        public int Id { get; set; }

        // Varsayılan Dil (TR)
        [Required]
        [MaxLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? WorkingHoursWeekday { get; set; }

        [MaxLength(100)]
        public string? WorkingHoursSaturday { get; set; }

        [MaxLength(100)]
        public string? WorkingHoursSunday { get; set; }

        // Dil-bağımsız
        [Required]
        [MaxLength(50)]
        public string Phone1 { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Phone2 { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email1 { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Email2 { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        // Harita
        [Column(TypeName = "decimal(10,8)")]
        public decimal? MapLatitude { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? MapLongitude { get; set; }

        public int MapZoomLevel { get; set; } = 15;

        // WhatsApp
        [MaxLength(50)]
        public string? WhatsAppNumber { get; set; }

        [MaxLength(500)]
        public string? WhatsAppDefaultMessage { get; set; }

        // Sosyal Medya (JSON)
        public string? SocialMediaLinks { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CreatedBy { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int UpdatedBy { get; set; }

        // Navigation Properties
        public virtual ICollection<ContactInfoTranslation> Translations { get; set; } = new List<ContactInfoTranslation>();
    }
}


