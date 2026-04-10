using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace wixi.Content.Entities
{
    /// <summary>
    /// Başarılı denklik belgesi projeleri ve referansları
    /// Successful recognition certificate projects and references
    /// </summary>
    [Table("wixi_ProjectReferences")]
    public class ProjectReference
    {
        public int Id { get; set; }

        /// <summary>
        /// Proje başlığı (örn: "Mühendislik Diploması Denkliği")
        /// </summary>
        public string Title { get; set; } = string.Empty;
        public string? TitleDe { get; set; }
        public string? TitleEn { get; set; }
        public string? TitleAr { get; set; }

        /// <summary>
        /// Proje açıklaması
        /// </summary>
        public string Description { get; set; } = string.Empty;
        public string? DescriptionDe { get; set; }
        public string? DescriptionEn { get; set; }
        public string? DescriptionAr { get; set; }

        /// <summary>
        /// Müşteri ismi (opsiyonel, anonim kalabilir)
        /// </summary>
        public string? ClientName { get; set; }

        /// <summary>
        /// Ülke (örn: "Türkiye", "Suriye")
        /// </summary>
        public string? Country { get; set; }

        /// <summary>
        /// Diploma/Belge türü (örn: "Mühendislik", "Tıp", "Hukuk")
        /// </summary>
        public string? DocumentType { get; set; }
        public string? DocumentTypeDe { get; set; }
        public string? DocumentTypeEn { get; set; }
        public string? DocumentTypeAr { get; set; }

        /// <summary>
        /// Üniversite/Kurum adı
        /// </summary>
        public string? University { get; set; }

        /// <summary>
        /// Başvuru tarihi
        /// </summary>
        public DateTime? ApplicationDate { get; set; }

        /// <summary>
        /// Onay tarihi
        /// </summary>
        public DateTime? ApprovalDate { get; set; }

        /// <summary>
        /// İşlem süresi (gün olarak)
        /// </summary>
        public int? ProcessingDays { get; set; }

        /// <summary>
        /// Belge görseli (önizleme için, blur/anonim)
        /// </summary>
        public string? DocumentImageUrl { get; set; }

        /// <summary>
        /// Başarı durumu (örn: "Onaylandı", "Hızlı Süreç", "Sorunsuz")
        /// </summary>
        public string? Status { get; set; }
        public string? StatusDe { get; set; }
        public string? StatusEn { get; set; }
        public string? StatusAr { get; set; }

        /// <summary>
        /// Öne çıkan özellikler (JSON array olarak saklanabilir)
        /// Örn: ["Hızlı işlem", "Ek belge gerektirmedi", "İlk başvuruda onaylandı"]
        /// </summary>
        public string? Highlights { get; set; }
        public string? HighlightsDe { get; set; }
        public string? HighlightsEn { get; set; }
        public string? HighlightsAr { get; set; }

        /// <summary>
        /// Aktif/Pasif durumu
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Öne çıkarılmış mı
        /// </summary>
        public bool IsFeatured { get; set; } = false;

        /// <summary>
        /// Görüntülenme sırası
        /// </summary>
        public int DisplayOrder { get; set; } = 0;

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}

