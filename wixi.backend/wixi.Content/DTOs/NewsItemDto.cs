using System;

namespace wixi.Content.DTOs
{
    public class NewsItemDto
    {
        public int Id { get; set; }
        
        // Multi-language Title
        public string TitleDe { get; set; } = string.Empty;
        public string TitleTr { get; set; } = string.Empty;
        public string? TitleEn { get; set; }
        public string? TitleAr { get; set; }
        
        // Multi-language Excerpt
        public string ExcerptDe { get; set; } = string.Empty;
        public string ExcerptTr { get; set; } = string.Empty;
        public string? ExcerptEn { get; set; }
        public string? ExcerptAr { get; set; }
        
        // Multi-language Content
        public string? ContentDe { get; set; }
        public string? ContentTr { get; set; }
        public string? ContentEn { get; set; }
        public string? ContentAr { get; set; }
        
        public string ImageUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool Featured { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string? Slug { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
