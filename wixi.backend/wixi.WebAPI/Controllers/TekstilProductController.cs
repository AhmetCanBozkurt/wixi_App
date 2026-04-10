using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/products")]
    public class TekstilProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<TekstilProductController> _logger;

        public TekstilProductController(
            IProductService productService,
            ILogger<TekstilProductController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        /// <summary>
        /// Get all products (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProductDto>>> GetAll([FromQuery] string? lang = null, [FromQuery] int? categoryId = null)
        {
            try
            {
                var products = await _productService.GetAllProductsAsync(lang, categoryId);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all products");
                return StatusCode(500, new { message = "An error occurred while retrieving products" });
            }
        }

        /// <summary>
        /// Get featured products (Public)
        /// </summary>
        [HttpGet("featured")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProductDto>>> GetFeatured([FromQuery] string? lang = null)
        {
            try
            {
                var products = await _productService.GetFeaturedProductsAsync(lang);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured products");
                return StatusCode(500, new { message = "An error occurred while retrieving featured products" });
            }
        }

        /// <summary>
        /// Get product by ID (Public)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductDto>> GetById(int id, [FromQuery] string? lang = null)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id, lang);
                if (product == null)
                    return NotFound(new { message = "Product not found" });

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the product" });
            }
        }

        /// <summary>
        /// Get product by slug (Public)
        /// </summary>
        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductDto>> GetBySlug(string slug, [FromQuery] string? lang = null)
        {
            try
            {
                var product = await _productService.GetProductBySlugAsync(slug, lang);
                if (product == null)
                    return NotFound(new { message = "Product not found" });

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by slug: {Slug}", slug);
                return StatusCode(500, new { message = "An error occurred while retrieving the product" });
            }
        }

        /// <summary>
        /// Create product (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto)
        {
            try
            {
                var product = await _productService.CreateProductAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, new { message = "An error occurred while creating the product" });
            }
        }

        /// <summary>
        /// Update product (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpdateProductDto dto)
        {
            try
            {
                var product = await _productService.UpdateProductAsync(id, dto);
                return Ok(product);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the product" });
            }
        }

        /// <summary>
        /// Delete product (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);
                if (!result)
                    return NotFound(new { message = "Product not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the product" });
            }
        }
    }
}


