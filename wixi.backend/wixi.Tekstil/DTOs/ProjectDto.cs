using System;
using System.Collections.Generic;

namespace wixi.Tekstil.DTOs
{
    public class ProjectCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? IconName { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public int ProjectCount { get; set; }
    }

    public class ProjectCategoryWithTranslationsDto : ProjectCategoryDto
    {
        public List<ProjectCategoryTranslationDto> Translations { get; set; } = new();
    }

    public class ProjectCategoryTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CreateProjectCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? IconName { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public List<ProjectCategoryTranslationDto>? Translations { get; set; }
    }

    public class UpdateProjectCategoryDto : CreateProjectCategoryDto { }

    public class ProjectDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public string? PrimaryImageAlt { get; set; }
        public int Year { get; set; }
        public int? Quantity { get; set; }
        public string? Duration { get; set; }
        public decimal? Budget { get; set; }
        public DateTime? CompletionDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public int DisplayOrder { get; set; }
        public int ViewCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ProjectDetailDto : ProjectDto
    {
        public List<ProjectTranslationDto> Translations { get; set; } = new();
        public List<ProjectImageDto> Images { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }

    public class ProjectTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? ClientName { get; set; }
        public string? Description { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
    }

    public class ProjectImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? ImageAlt { get; set; }
        public string? ImageTitle { get; set; }
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateProjectDto
    {
        public int CategoryId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public string? PrimaryImageAlt { get; set; }
        public int Year { get; set; }
        public int? Quantity { get; set; }
        public string? Duration { get; set; }
        public decimal? Budget { get; set; }
        public DateTime? CompletionDate { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public int DisplayOrder { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public List<ProjectTranslationDto>? Translations { get; set; }
        public List<ProjectImageDto>? Images { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class UpdateProjectDto : CreateProjectDto { }

    public class ProjectListQueryDto
    {
        public int? CategoryId { get; set; }
        public int? Year { get; set; }
        public string? SearchTerm { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsActive { get; set; }
        public string? SortBy { get; set; } = "DisplayOrder";
        public string? SortOrder { get; set; } = "asc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 9;
        public string LanguageCode { get; set; } = "tr";
    }

    public class ProjectListResponseDto
    {
        public List<ProjectDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}


