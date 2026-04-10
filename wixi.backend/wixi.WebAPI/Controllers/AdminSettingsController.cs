using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.Interfaces;
using wixi.Content.DTOs;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/settings")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminSettingsController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<AdminSettingsController> _logger;

    public AdminSettingsController(
        IContentService contentService,
        ILogger<AdminSettingsController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// Get system settings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SystemSettingsDto>> GetSettings()
    {
        try
        {
            var settings = await _contentService.GetSystemSettingsAsync();
            if (settings == null)
            {
                return Ok(new SystemSettingsDto());
            }
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system settings");
            return StatusCode(500, new { message = "Error getting system settings" });
        }
    }

    /// <summary>
    /// Update system settings
    /// </summary>
    [HttpPut]
    public async Task<ActionResult> UpdateSettings([FromBody] UpdateSystemSettingsRequest req)
    {
        try
        {
            var dto = new SystemSettingsDto
            {
                SiteName = req.SiteName,
                SiteUrl = req.SiteUrl,
                AdminEmail = req.AdminEmail,
                PortalUrl = req.PortalUrl,
                SupportEmail = req.SupportEmail
            };

            await _contentService.UpsertSystemSettingsAsync(dto, User?.Identity?.Name);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating system settings");
            return StatusCode(500, new { message = "Error updating system settings" });
        }
    }
}

public class UpdateSystemSettingsRequest
{
    public string SiteName { get; set; } = string.Empty;
    public string SiteUrl { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string? PortalUrl { get; set; }
    public string? SupportEmail { get; set; }
}

