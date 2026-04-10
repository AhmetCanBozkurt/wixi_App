using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Content.DTOs;
using wixi.Content.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/user-preferences")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize] // Require authentication for all endpoints
public class AdminUserPreferencesController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminUserPreferencesController> _logger;

    public AdminUserPreferencesController(
        IContentService contentService,
        WixiDbContext context,
        ILogger<AdminUserPreferencesController> logger)
    {
        _contentService = contentService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all user preferences with pagination (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<ActionResult> GetAllUserPreferences(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var query = _context.UserPreferences.AsQueryable();

            var total = await query.CountAsync();
            var preferences = await query
                .OrderBy(up => up.UserId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(up => new
                {
                    up.Id,
                    up.UserId,
                    up.Language,
                    up.Theme
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                items = preferences,
                page,
                pageSize,
                total,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user preferences");
            return StatusCode(500, new { success = false, message = "Error fetching user preferences" });
        }
    }

    /// <summary>
    /// Get current user's preferences (accessible by all authenticated users)
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult> GetMyPreference()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }
            
            var preference = await _contentService.GetOrCreateUserPreferenceAsync(userId.ToString());
            return Ok(new { 
                success = true, 
                language = preference.Language,
                theme = preference.Theme
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user preference");
            return StatusCode(500, new { success = false, message = "Error fetching user preference" });
        }
    }

    /// <summary>
    /// Update current user's preferences (accessible by all authenticated users)
    /// </summary>
    [HttpPut("me")]
    public async Task<ActionResult> UpdateMyPreference([FromBody] UpdateUserPreferenceRequest req)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }
            
            var preference = await _contentService.UpsertUserPreferenceAsync(userId.ToString(), req.Language, req.Theme);
            return Ok(new { 
                success = true, 
                language = preference.Language,
                theme = preference.Theme
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user preference");
            return StatusCode(500, new { success = false, message = "Error updating user preference" });
        }
    }

    /// <summary>
    /// Get user preference by user ID (Admin only)
    /// </summary>
    [HttpGet("{userId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<ActionResult> GetUserPreference(string userId)
    {
        try
        {
            var preference = await _contentService.GetOrCreateUserPreferenceAsync(userId);
            return Ok(new { success = true, item = preference });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user preference: {UserId}", userId);
            return StatusCode(500, new { success = false, message = "Error fetching user preference" });
        }
    }

    /// <summary>
    /// Update user preference (Admin only)
    /// </summary>
    [HttpPut("{userId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<ActionResult> UpdateUserPreference(string userId, [FromBody] UpdateUserPreferenceRequest req)
    {
        try
        {
            var preference = await _contentService.UpsertUserPreferenceAsync(userId, req.Language, req.Theme);
            return Ok(new { success = true, item = preference });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user preference: {UserId}", userId);
            return StatusCode(500, new { success = false, message = "Error updating user preference" });
        }
    }
}

public class UpdateUserPreferenceRequest
{
    public string? Language { get; set; }
    public string? Theme { get; set; }
}

