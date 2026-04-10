using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.DTOs;
using wixi.Content.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/news")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminNewsController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<AdminNewsController> _logger;

    public AdminNewsController(
        IContentService contentService,
        ILogger<AdminNewsController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// Get all news items (admin)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAllNewsItems()
    {
        try
        {
            var newsItems = await _contentService.GetAllNewsItemsAsync(activeOnly: false);
            return Ok(new { success = true, items = newsItems });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching news items");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching news items" });
        }
    }

    /// <summary>
    /// Get news item by ID (admin)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetNewsItemById(int id)
    {
        try
        {
            var newsItem = await _contentService.GetNewsItemByIdAsync(id);
            return Ok(new { success = true, item = newsItem });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching news item by ID: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching news item" });
        }
    }

    /// <summary>
    /// Create news item (admin)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateNewsItem([FromBody] NewsItemDto dto)
    {
        try
        {
            var newsItem = await _contentService.CreateNewsItemAsync(dto);
            return Ok(new { success = true, item = newsItem, message = "News item created successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating news item");
            return StatusCode(500, new { success = false, message = "An error occurred while creating news item" });
        }
    }

    /// <summary>
    /// Update news item (admin)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateNewsItem(int id, [FromBody] NewsItemDto dto)
    {
        try
        {
            var newsItem = await _contentService.UpdateNewsItemAsync(id, dto);
            return Ok(new { success = true, item = newsItem, message = "News item updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating news item: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while updating news item" });
        }
    }

    /// <summary>
    /// Delete news item (admin)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteNewsItem(int id)
    {
        try
        {
            var deleted = await _contentService.DeleteNewsItemAsync(id);
            if (!deleted)
            {
                return NotFound(new { success = false, message = "News item not found" });
            }
            return Ok(new { success = true, message = "News item deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting news item: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while deleting news item" });
        }
    }
}

