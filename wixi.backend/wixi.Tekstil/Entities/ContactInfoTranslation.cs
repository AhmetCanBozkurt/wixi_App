using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class ContactInfoTranslation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ContactInfoId { get; set; }

        [Required]
        [MaxLength(10)]
        public string LanguageCode { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? CompanyName { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? WorkingHoursWeekday { get; set; }

        [MaxLength(100)]
        public string? WorkingHoursSaturday { get; set; }

        [MaxLength(100)]
        public string? WorkingHoursSunday { get; set; }

        [MaxLength(500)]
        public string? WhatsAppDefaultMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("ContactInfoId")]
        public virtual ContactInfo ContactInfo { get; set; } = null!;

        [ForeignKey("LanguageCode")]
        public virtual Language Language { get; set; } = null!;
    }
}


