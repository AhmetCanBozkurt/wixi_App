using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{
    public class Language
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string Code { get; set; } = string.Empty; // 'tr', 'en', 'de'

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // 'Turkish'

        [Required]
        [MaxLength(100)]
        public string NativeName { get; set; } = string.Empty; // 'Türkçe'

        [MaxLength(100)]
        public string? FlagIcon { get; set; } // '🇹🇷' or icon path

        public bool IsDefault { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

