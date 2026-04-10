using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/product-categories")]
    public class TekstilProductCategoryController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<TekstilProductCategoryController> _logger;

        public TekstilProductCategoryController(
            IProductService productService,
            ILogger<TekstilProductCategoryController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        /// <summary>
        /// Get all product categories (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProductCategoryDto>>> GetAll([FromQuery] string? lang = null)
        {
            try
            {
                var categories = await _productService.GetAllCategoriesAsync(lang);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all product categories");
                return StatusCode(500, new { message = "An error occurred while retrieving product categories" });
            }
        }

        /// <summary>
        /// Get product category by ID (Public)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductCategoryDto>> GetById(int id, [FromQuery] string? lang = null)
        {
            try
            {
                var category = await _productService.GetCategoryByIdAsync(id, lang);
                if (category == null)
                    return NotFound(new { message = "Product category not found" });

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product category by ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the product category" });
            }
        }

        /// <summary>
        /// Create product category (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductCategoryDto>> Create([FromBody] CreateProductCategoryDto dto)
        {
            try
            {
                var category = await _productService.CreateCategoryAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product category");
                return StatusCode(500, new { message = "An error occurred while creating the product category" });
            }
        }

        /// <summary>
        /// Update product category (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductCategoryDto>> Update(int id, [FromBody] UpdateProductCategoryDto dto)
        {
            try
            {
                var category = await _productService.UpdateCategoryAsync(id, dto);
                return Ok(category);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product category {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the product category" });
            }
        }

        /// <summary>
        /// Delete product category (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _productService.DeleteCategoryAsync(id);
                if (!result)
                    return NotFound(new { message = "Product category not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product category {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the product category" });
            }
        }
    }
}


