using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Tekstil.Entities
{    public class ContactSubmission
    {
        [Key]
        public int Id { get; set; }

        // Form Bilgileri
        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(200)]
        public string? Subject { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;

        // Durum Yönetimi
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "New"; // 'New', 'InProgress', 'Completed', 'Cancelled'

        [MaxLength(50)]
        public string Priority { get; set; } = "Medium"; // 'Low', 'Medium', 'High', 'Urgent'

        // Atama
        public int? AssignedTo { get; set; }

        public DateTime? AssignedAt { get; set; }

        // Yanıt
        public string? ResponseMessage { get; set; }

        public DateTime? ResponseDate { get; set; }

        public int? ResponseBy { get; set; }

        // Takip
        public DateTime? FollowUpDate { get; set; }

        [MaxLength(500)]
        public string? Tags { get; set; }

        // Kaynak
        [MaxLength(100)]
        public string Source { get; set; } = "Website"; // 'Website', 'WhatsApp', 'Phone', 'Email'

        [MaxLength(10)]
        public string LanguageCode { get; set; } = "tr";

        // Teknik
        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        [MaxLength(500)]
        public string? ReferrerUrl { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}


