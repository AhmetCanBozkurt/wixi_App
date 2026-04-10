using System;
using System.Collections.Generic;

namespace wixi.Tekstil.DTOs
{
    public class ProductCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? IconName { get; set; }
        public string? ImageUrl { get; set; }
        public int? ParentCategoryId { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public int ProductCount { get; set; }
    }

    public class ProductCategoryWithTranslationsDto : ProductCategoryDto
    {
        public List<ProductCategoryTranslationDto> Translations { get; set; } = new();
    }

    public class ProductCategoryTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
    }

    public class CreateProductCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? IconName { get; set; }
        public string? ImageUrl { get; set; }
        public int? ParentCategoryId { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public List<ProductCategoryTranslationDto>? Translations { get; set; }
    }

    public class UpdateProductCategoryDto : CreateProductCategoryDto { }

    public class ProductDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ShortDescription { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? SKU { get; set; }
        public decimal? Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string Currency { get; set; } = "TRY";
        public int MinOrderQuantity { get; set; }
        public string? PrimaryImageUrl { get; set; }
        public string? PrimaryImageAlt { get; set; }
        public string? Features { get; set; }
        public string? Specifications { get; set; }
        public int StockQuantity { get; set; }
        public bool IsInStock { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsNew { get; set; }
        public int DisplayOrder { get; set; }
        public int ViewCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ProductDetailDto : ProductDto
    {
        public List<ProductTranslationDto> Translations { get; set; } = new();
        public List<ProductImageDto> Images { get; set; } = new();
    }

    public class ProductTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ShortDescription { get; set; }
        public string? Features { get; set; }
        public string? Specifications { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? ImageAlt { get; set; }
        public string? ImageTitle { get; set; }
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateProductDto
    {
        public int CategoryId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ShortDescription { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string? SKU { get; set; }
        public decimal? Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string Currency { get; set; } = "TRY";
        public int MinOrderQuantity { get; set; } = 1;
        public string? PrimaryImageUrl { get; set; }
        public string? PrimaryImageAlt { get; set; }
        public string? Features { get; set; }
        public string? Specifications { get; set; }
        public int StockQuantity { get; set; } = 0;
        public bool IsInStock { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public bool IsNew { get; set; } = false;
        public int DisplayOrder { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }
        public List<ProductTranslationDto>? Translations { get; set; }
        public List<ProductImageDto>? Images { get; set; }
    }

    public class UpdateProductDto : CreateProductDto { }

    public class ProductListQueryDto
    {
        public int? CategoryId { get; set; }
        public string? SearchTerm { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsNew { get; set; }
        public bool? IsActive { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SortBy { get; set; } = "DisplayOrder";
        public string? SortOrder { get; set; } = "asc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public string LanguageCode { get; set; } = "tr";
    }

    public class ProductListResponseDto
    {
        public List<ProductDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}


