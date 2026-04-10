using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Entities;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Services.Tekstil
{
    public class ProductService : IProductService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<ProductService> _logger;

        public ProductService(WixiDbContext context, ILogger<ProductService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Product Methods

        public async Task<List<ProductDto>> GetAllProductsAsync(string? languageCode = null, int? categoryId = null)
        {
            var query = _context.TekstilProducts
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var products = await query
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.Title)
                .ToListAsync();

            return products.Select(p => MapToDto(p, languageCode)).ToList();
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id, string? languageCode = null)
        {
            var product = await _context.TekstilProducts
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            return product == null ? null : MapToDto(product, languageCode);
        }

        public async Task<ProductDto?> GetProductBySlugAsync(string slug, string? languageCode = null)
        {
            var product = await _context.TekstilProducts
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Slug == slug);

            return product == null ? null : MapToDto(product, languageCode);
        }

        public async Task<List<ProductDto>> GetFeaturedProductsAsync(string? languageCode = null)
        {
            var products = await _context.TekstilProducts
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .Where(p => p.IsActive && p.IsFeatured)
                .OrderBy(p => p.DisplayOrder)
                .ToListAsync();

            return products.Select(p => MapToDto(p, languageCode)).ToList();
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
        {
            var product = new Product
            {
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                ShortDescription = dto.ShortDescription,
                Slug = dto.Slug,
                SKU = dto.SKU,
                Price = dto.Price,
                DiscountPrice = dto.DiscountPrice,
                Currency = dto.Currency,
                MinOrderQuantity = dto.MinOrderQuantity,
                PrimaryImageUrl = dto.PrimaryImageUrl,
                PrimaryImageAlt = dto.PrimaryImageAlt,
                Features = dto.Features,
                Specifications = dto.Specifications,
                StockQuantity = dto.StockQuantity,
                IsInStock = dto.IsInStock,
                IsActive = dto.IsActive,
                IsFeatured = dto.IsFeatured,
                IsNew = dto.IsNew,
                DisplayOrder = dto.DisplayOrder,
                ViewCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TekstilProducts.Add(product);
            await _context.SaveChangesAsync();

            // Add translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProductTranslation
                    {
                        ProductId = product.Id,
                        LanguageCode = trans.LanguageCode,
                        Title = trans.Title,
                        Description = trans.Description,
                        ShortDescription = trans.ShortDescription,
                        Features = trans.Features,
                        Specifications = trans.Specifications,
                        MetaTitle = trans.MetaTitle,
                        MetaDescription = trans.MetaDescription,
                        MetaKeywords = trans.MetaKeywords,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProductTranslations.Add(translation);
                }
            }

            // Add images
            if (dto.Images != null && dto.Images.Any())
            {
                foreach (var img in dto.Images)
                {
                    var image = new ProductImage
                    {
                        ProductId = product.Id,
                        ImageUrl = img.ImageUrl,
                        ImageAlt = img.ImageAlt,
                        ImageTitle = img.ImageTitle,
                        IsPrimary = img.IsPrimary,
                        DisplayOrder = img.DisplayOrder,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProductImages.Add(image);
                }
            }

            await _context.SaveChangesAsync();
            return (await GetProductByIdAsync(product.Id))!;
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto)
        {
            var product = await _context.TekstilProducts
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                throw new KeyNotFoundException($"Product with ID {id} not found");

            product.CategoryId = dto.CategoryId;
            product.Title = dto.Title;
            product.Description = dto.Description;
            product.ShortDescription = dto.ShortDescription;
            product.Slug = dto.Slug;
            product.SKU = dto.SKU;
            product.Price = dto.Price;
            product.DiscountPrice = dto.DiscountPrice;
            product.Currency = dto.Currency;
            product.MinOrderQuantity = dto.MinOrderQuantity;
            product.PrimaryImageUrl = dto.PrimaryImageUrl;
            product.PrimaryImageAlt = dto.PrimaryImageAlt;
            product.Features = dto.Features;
            product.Specifications = dto.Specifications;
            product.StockQuantity = dto.StockQuantity;
            product.IsInStock = dto.IsInStock;
            product.IsActive = dto.IsActive;
            product.IsFeatured = dto.IsFeatured;
            product.IsNew = dto.IsNew;
            product.DisplayOrder = dto.DisplayOrder;
            product.UpdatedAt = DateTime.UtcNow;

            // Update translations
            if (dto.Translations != null)
            {
                // Remove old translations
                _context.TekstilProductTranslations.RemoveRange(product.Translations);
                
                // Add new translations
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProductTranslation
                    {
                        ProductId = product.Id,
                        LanguageCode = trans.LanguageCode,
                        Title = trans.Title,
                        Description = trans.Description,
                        ShortDescription = trans.ShortDescription,
                        Features = trans.Features,
                        Specifications = trans.Specifications,
                        MetaTitle = trans.MetaTitle,
                        MetaDescription = trans.MetaDescription,
                        MetaKeywords = trans.MetaKeywords,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProductTranslations.Add(translation);
                }
            }

            // Update images
            if (dto.Images != null)
            {
                // Remove old images
                _context.TekstilProductImages.RemoveRange(product.Images);
                
                // Add new images
                foreach (var img in dto.Images)
                {
                    var image = new ProductImage
                    {
                        ProductId = product.Id,
                        ImageUrl = img.ImageUrl,
                        ImageAlt = img.ImageAlt,
                        ImageTitle = img.ImageTitle,
                        IsPrimary = img.IsPrimary,
                        DisplayOrder = img.DisplayOrder,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProductImages.Add(image);
                }
            }

            await _context.SaveChangesAsync();
            return (await GetProductByIdAsync(product.Id))!;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.TekstilProducts.FindAsync(id);
            if (product == null)
                return false;

            _context.TekstilProducts.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        private ProductDto MapToDto(Product product, string? languageCode = null)
        {
            var dto = new ProductDto
            {
                Id = product.Id,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                Title = product.Title,
                Description = product.Description,
                ShortDescription = product.ShortDescription,
                Slug = product.Slug,
                SKU = product.SKU,
                Price = product.Price,
                DiscountPrice = product.DiscountPrice,
                Currency = product.Currency,
                MinOrderQuantity = product.MinOrderQuantity,
                PrimaryImageUrl = product.PrimaryImageUrl,
                PrimaryImageAlt = product.PrimaryImageAlt,
                Features = product.Features,
                Specifications = product.Specifications,
                StockQuantity = product.StockQuantity,
                IsInStock = product.IsInStock,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                IsNew = product.IsNew,
                DisplayOrder = product.DisplayOrder,
                ViewCount = product.ViewCount,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };

            // If language code is specified, use translation
            if (!string.IsNullOrEmpty(languageCode))
            {
                var translation = product.Translations?.FirstOrDefault(t => t.LanguageCode == languageCode);
                if (translation != null)
                {
                    dto.Title = translation.Title;
                    dto.Description = translation.Description;
                    dto.ShortDescription = translation.ShortDescription;
                    dto.Features = translation.Features;
                    dto.Specifications = translation.Specifications;
                }
            }

            return dto;
        }

        #endregion

        #region Category Methods

        public async Task<List<ProductCategoryDto>> GetAllCategoriesAsync(string? languageCode = null)
        {
            var categories = await _context.TekstilProductCategories
                .Include(c => c.Translations)
                .Include(c => c.Products)
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .ToListAsync();

            return categories.Select(c => MapCategoryToDto(c, languageCode)).ToList();
        }

        public async Task<ProductCategoryDto?> GetCategoryByIdAsync(int id, string? languageCode = null)
        {
            var category = await _context.TekstilProductCategories
                .Include(c => c.Translations)
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            return category == null ? null : MapCategoryToDto(category, languageCode);
        }

        public async Task<ProductCategoryDto> CreateCategoryAsync(CreateProductCategoryDto dto)
        {
            var category = new ProductCategory
            {
                Name = dto.Name,
                Description = dto.Description,
                Slug = dto.Slug,
                IconName = dto.IconName,
                ImageUrl = dto.ImageUrl,
                ParentCategoryId = dto.ParentCategoryId,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TekstilProductCategories.Add(category);
            await _context.SaveChangesAsync();

            // Add translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProductCategoryTranslation
                    {
                        CategoryId = category.Id,
                        LanguageCode = trans.LanguageCode,
                        Name = trans.Name,
                        Description = trans.Description,
                        MetaTitle = trans.MetaTitle,
                        MetaDescription = trans.MetaDescription,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProductCategoryTranslations.Add(translation);
                }
                await _context.SaveChangesAsync();
            }

            return (await GetCategoryByIdAsync(category.Id))!;
        }

        public async Task<ProductCategoryDto> UpdateCategoryAsync(int id, UpdateProductCategoryDto dto)
        {
            var category = await _context.TekstilProductCategories
                .Include(c => c.Translations)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                throw new KeyNotFoundException($"Product category with ID {id} not found");

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.Slug = dto.Slug;
            category.IconName = dto.IconName;
            category.ImageUrl = dto.ImageUrl;
            category.ParentCategoryId = dto.ParentCategoryId;
            category.DisplayOrder = dto.DisplayOrder;
            category.IsActive = dto.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            // Update translations
            if (dto.Translations != null)
            {
                // Remove old translations
                _context.TekstilProductCategoryTranslations.RemoveRange(category.Translations);
                
                // Add new translations
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProductCategoryTranslation
                    {
                        CategoryId = category.Id,
                        LanguageCode = trans.LanguageCode,
                        Name = trans.Name,
                        Description = trans.Description,
                        MetaTitle = trans.MetaTitle,
                        MetaDescription = trans.MetaDescription,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProductCategoryTranslations.Add(translation);
                }
            }

            await _context.SaveChangesAsync();
            return (await GetCategoryByIdAsync(category.Id))!;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.TekstilProductCategories.FindAsync(id);
            if (category == null)
                return false;

            _context.TekstilProductCategories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        private ProductCategoryDto MapCategoryToDto(ProductCategory category, string? languageCode = null)
        {
            var dto = new ProductCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Slug = category.Slug,
                IconName = category.IconName,
                ImageUrl = category.ImageUrl,
                ParentCategoryId = category.ParentCategoryId,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                ProductCount = category.Products?.Count(p => p.IsActive) ?? 0
            };

            // If language code is specified, use translation
            if (!string.IsNullOrEmpty(languageCode))
            {
                var translation = category.Translations?.FirstOrDefault(t => t.LanguageCode == languageCode);
                if (translation != null)
                {
                    dto.Name = translation.Name;
                    dto.Description = translation.Description;
                }
            }

            return dto;
        }

        #endregion
    }
}


