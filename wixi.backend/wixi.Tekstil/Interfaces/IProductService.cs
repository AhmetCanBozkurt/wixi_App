using System.Collections.Generic;
using System.Threading.Tasks;
using wixi.Tekstil.DTOs;

namespace wixi.Tekstil.Interfaces
{
    public interface IProductService
    {
        Task<List<ProductDto>> GetAllProductsAsync(string? languageCode = null, int? categoryId = null);
        Task<ProductDto?> GetProductByIdAsync(int id, string? languageCode = null);
        Task<ProductDto?> GetProductBySlugAsync(string slug, string? languageCode = null);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto);
        Task<bool> DeleteProductAsync(int id);
        Task<List<ProductDto>> GetFeaturedProductsAsync(string? languageCode = null);
        Task<List<ProductCategoryDto>> GetAllCategoriesAsync(string? languageCode = null);
        Task<ProductCategoryDto?> GetCategoryByIdAsync(int id, string? languageCode = null);
        Task<ProductCategoryDto> CreateCategoryAsync(CreateProductCategoryDto dto);
        Task<ProductCategoryDto> UpdateCategoryAsync(int id, UpdateProductCategoryDto dto);
        Task<bool> DeleteCategoryAsync(int id);
    }
}
