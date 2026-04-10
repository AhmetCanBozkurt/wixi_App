using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.Interfaces;
using wixi.Content.DTOs;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/content-settings")]
[Asp.Versioning.ApiVersion("1.0")]
public class ContentSettingsController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<ContentSettingsController> _logger;

    public ContentSettingsController(IContentService contentService, ILogger<ContentSettingsController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// Get content settings (public) - supports lang parameter for language-specific content
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetContentSettings([FromQuery] string? lang = "de")
    {
        try
        {
            // If lang parameter is provided, return language-specific public content
            if (!string.IsNullOrEmpty(lang))
            {
                var publicResult = await _contentService.GetPublicContentSettingsAsync(lang);
                if (publicResult == null)
                {
                    return NotFound(new { success = false, message = "Content settings not found" });
                }
                return Ok(publicResult);
            }
            
            // Otherwise return full content settings (for admin use)
            var result = await _contentService.GetContentSettingsAsync();
            if (result == null)
            {
                return NotFound(new { success = false, message = "Content settings not found" });
            }
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching content settings");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching content settings" });
        }
    }

    /// <summary>
    /// Update content settings (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpsertContentSettings([FromBody] ContentSettingsDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var updatedBy = userIdClaim?.Value;
            
            var result = await _contentService.UpsertContentSettingsAsync(dto, updatedBy);
            return Ok(new { success = true, message = "Content settings updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating content settings");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get system settings (public)
    /// </summary>
    [HttpGet("system")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSystemSettings()
    {
        try
        {
            var result = await _contentService.GetSystemSettingsAsync();
            if (result == null)
            {
                return NotFound(new { success = false, message = "System settings not found" });
            }
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching system settings");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching system settings" });
        }
    }

    /// <summary>
    /// Update system settings (Admin only)
    /// </summary>
    [HttpPost("system")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpsertSystemSettings([FromBody] SystemSettingsDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var updatedBy = userIdClaim?.Value;
            
            var result = await _contentService.UpsertSystemSettingsAsync(dto, updatedBy);
            return Ok(new { success = true, message = "System settings updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system settings");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get or create user preference
    /// </summary>
    [HttpGet("user-preference")]
    [Authorize]
    public async Task<IActionResult> GetUserPreference()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }
            
            var result = await _contentService.GetOrCreateUserPreferenceAsync(userIdClaim.Value);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user preference");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update user preference
    /// </summary>
    [HttpPost("user-preference")]
    [Authorize]
    public async Task<IActionResult> UpsertUserPreference([FromBody] UserPreferenceUpdateDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }
            
            var result = await _contentService.UpsertUserPreferenceAsync(userIdClaim.Value, dto.Language, dto.Theme);
            return Ok(new { success = true, message = "User preference updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user preference");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

/// <summary>
/// DTO for updating user preference
/// </summary>
public class UserPreferenceUpdateDto
{
    public string? Language { get; set; }
    public string? Theme { get; set; }
}

