using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.Interfaces;
using wixi.Content.DTOs;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public class NewsController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<NewsController> _logger;

    public NewsController(IContentService contentService, ILogger<NewsController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// Get all active news items (public)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetNewsItems([FromQuery] bool activeOnly = true)
    {
        try
        {
            var result = await _contentService.GetAllNewsItemsAsync(activeOnly);
            return Ok(new { success = true, items = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching news items");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching news items" });
        }
    }

    /// <summary>
    /// Get news item by ID (public)
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNewsItemById(int id)
    {
        try
        {
            var result = await _contentService.GetNewsItemByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { success = false, message = "News item not found" });
            }
            return Ok(new { success = true, item = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching news item by ID: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching news item" });
        }
    }

    /// <summary>
    /// Get news item by slug (public)
    /// </summary>
    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNewsItemBySlug(string slug)
    {
        try
        {
            var result = await _contentService.GetNewsItemBySlugAsync(slug);
            if (result == null)
            {
                return NotFound(new { success = false, message = "News item not found" });
            }
            return Ok(new { success = true, item = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching news item by slug: {Slug}", slug);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching news item" });
        }
    }

    /// <summary>
    /// Create news item (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> CreateNewsItem([FromBody] NewsItemDto dto)
    {
        try
        {
            var result = await _contentService.CreateNewsItemAsync(dto);
            return Ok(new { success = true, message = "News item created successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating news item");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update news item (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpdateNewsItem(int id, [FromBody] NewsItemDto dto)
    {
        try
        {
            var result = await _contentService.UpdateNewsItemAsync(id, dto);
            return Ok(new { success = true, message = "News item updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating news item {Id}", id);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete news item (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteNewsItem(int id)
    {
        try
        {
            var result = await _contentService.DeleteNewsItemAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "News item not found" });
            }
            return Ok(new { success = true, message = "News item deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting news item {Id}", id);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

