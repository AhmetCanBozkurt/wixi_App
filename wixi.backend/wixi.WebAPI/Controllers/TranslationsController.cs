using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.Interfaces;
using wixi.Content.DTOs;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/i18n")]
[Asp.Versioning.ApiVersion("1.0")]
public class TranslationsController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<TranslationsController> _logger;

    public TranslationsController(IContentService contentService, ILogger<TranslationsController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// Get translations for a language (public)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetTranslations([FromQuery] string lang = "de")
    {
        try
        {
            var result = await _contentService.GetTranslationsAsync(lang);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching translations for language {Lang}", lang);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching translations" });
        }
    }

    /// <summary>
    /// List all translations (Admin only)
    /// </summary>
    [HttpGet("list")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> ListTranslations([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var result = await _contentService.ListTranslationsAsync(search, page, pageSize);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing translations");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get translation by key (Admin only)
    /// </summary>
    [HttpGet("key/{key}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> GetTranslationByKey(string key)
    {
        try
        {
            var result = await _contentService.GetTranslationByKeyAsync(key);
            if (result == null)
            {
                return NotFound(new { success = false, message = "Translation not found" });
            }
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching translation by key {Key}", key);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Create or update translation (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpsertTranslation([FromBody] TranslationDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var updatedBy = userIdClaim?.Value;
            
            var result = await _contentService.UpsertTranslationAsync(dto, updatedBy);
            return Ok(new { success = true, message = "Translation saved successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting translation");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete translation (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteTranslation(long id)
    {
        try
        {
            await _contentService.DeleteTranslationAsync(id);
            return Ok(new { success = true, message = "Translation deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting translation {Id}", id);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

