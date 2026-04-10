using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.Interfaces;
using wixi.Content.DTOs;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/content-settings")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminContentSettingsController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<AdminContentSettingsController> _logger;

    public AdminContentSettingsController(
        IContentService contentService,
        ILogger<AdminContentSettingsController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// Get content settings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ContentSettingsDto>> GetSettings()
    {
        try
        {
            var settings = await _contentService.GetContentSettingsAsync();
            if (settings == null)
            {
                return Ok(new ContentSettingsDto());
            }
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content settings");
            return StatusCode(500, new { message = "Error getting content settings" });
        }
    }

    /// <summary>
    /// Update content settings
    /// </summary>
    [HttpPut]
    public async Task<ActionResult> UpdateSettings([FromBody] ContentSettingsDto dto)
    {
        try
        {
            await _contentService.UpsertContentSettingsAsync(dto, User?.Identity?.Name);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating content settings");
            return StatusCode(500, new { message = "Error updating content settings" });
        }
    }
}

