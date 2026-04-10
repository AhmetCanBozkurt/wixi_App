using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.DTOs;
using wixi.Content.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/translations")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminTranslationsController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<AdminTranslationsController> _logger;

    public AdminTranslationsController(
        IContentService contentService,
        ILogger<AdminTranslationsController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// List translations with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> ListTranslations(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var translations = await _contentService.ListTranslationsAsync(search, page, pageSize);
            return Ok(new { success = true, items = translations });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing translations");
            return StatusCode(500, new { success = false, message = "Error listing translations" });
        }
    }

    /// <summary>
    /// Get translation by key
    /// </summary>
    [HttpGet("{key}")]
    public async Task<ActionResult> GetTranslationByKey(string key)
    {
        try
        {
            var translation = await _contentService.GetTranslationByKeyAsync(key);
            if (translation == null)
            {
                return NotFound(new { success = false, message = "Translation not found" });
            }
            return Ok(new { success = true, item = translation });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching translation: {Key}", key);
            return StatusCode(500, new { success = false, message = "Error fetching translation" });
        }
    }

    /// <summary>
    /// Create or update translation
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> UpsertTranslation([FromBody] TranslationDto dto)
    {
        try
        {
            var translation = await _contentService.UpsertTranslationAsync(dto, User?.Identity?.Name);
            _contentService.InvalidateTranslationCache();
            return Ok(new { success = true, item = translation });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting translation");
            return StatusCode(500, new { success = false, message = "Error upserting translation" });
        }
    }

    /// <summary>
    /// Delete translation
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTranslation(long id)
    {
        try
        {
            await _contentService.DeleteTranslationAsync(id);
            _contentService.InvalidateTranslationCache();
            return Ok(new { success = true, message = "Translation deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting translation: {Id}", id);
            return StatusCode(500, new { success = false, message = "Error deleting translation" });
        }
    }

    /// <summary>
    /// Invalidate translation cache (force reload)
    /// </summary>
    [HttpPost("invalidate")]
    public ActionResult InvalidateCache([FromQuery] string? lang = null)
    {
        try
        {
            _contentService.InvalidateTranslationCache(lang);
            _logger.LogInformation("Translation cache invalidated for language: {Lang}", lang ?? "all");
            return Ok(new { success = true, message = $"Translation cache cleared for {lang ?? "all languages"}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating translation cache");
            return StatusCode(500, new { success = false, message = "Error invalidating cache" });
        }
    }
}

