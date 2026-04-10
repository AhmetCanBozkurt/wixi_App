using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Identity.DTOs;
using wixi.Identity.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/menu-permissions")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class MenuPermissionsController : ControllerBase
{
    private readonly IMenuPermissionService _menuPermissionService;
    private readonly ILogger<MenuPermissionsController> _logger;

    public MenuPermissionsController(
        IMenuPermissionService menuPermissionService,
        ILogger<MenuPermissionsController> logger)
    {
        _menuPermissionService = menuPermissionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all menu permissions
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAllMenuPermissions()
    {
        try
        {
            var result = await _menuPermissionService.GetAllMenuPermissionsAsync();
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving menu permissions");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get menu permissions grouped by user
    /// </summary>
    [HttpGet("grouped-by-user")]
    public async Task<ActionResult> GetMenuPermissionsGroupedByUser()
    {
        try
        {
            var result = await _menuPermissionService.GetMenuPermissionsGroupedByUserAsync();
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving menu permissions grouped by user");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get menu permissions for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult> GetMenuPermissionsByUserId(int userId)
    {
        try
        {
            var result = await _menuPermissionService.GetMenuPermissionsByUserIdAsync(userId);
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving menu permissions for user {UserId}", userId);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get visible menus for current user
    /// </summary>
    [HttpGet("my-menus")]
    [Authorize]
    public async Task<ActionResult> GetMyVisibleMenus()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value) || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            var result = await _menuPermissionService.GetVisibleMenusForUserAsync(userId);
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving visible menus for current user");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get menu permission by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetMenuPermissionById(int id)
    {
        try
        {
            var result = await _menuPermissionService.GetMenuPermissionByIdAsync(id);
            if (result == null)
                return NotFound(new { success = false, message = "Menu permission not found" });

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving menu permission {Id}", id);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new menu permission
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateMenuPermission([FromBody] CreateMenuPermissionDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request data", errors = ModelState });

            var result = await _menuPermissionService.CreateMenuPermissionAsync(dto);
            return CreatedAtAction(nameof(GetMenuPermissionById), new { id = result.Id }, 
                new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating menu permission");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update a menu permission
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateMenuPermission(int id, [FromBody] UpdateMenuPermissionDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request data", errors = ModelState });

            var result = await _menuPermissionService.UpdateMenuPermissionAsync(id, dto);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating menu permission {Id}", id);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a menu permission
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMenuPermission(int id)
    {
        try
        {
            var result = await _menuPermissionService.DeleteMenuPermissionAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Menu permission not found" });

            return Ok(new { success = true, message = "Menu permission deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting menu permission {Id}", id);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Bulk update menu permissions for a user
    /// </summary>
    [HttpPut("user/{userId}/bulk")]
    public async Task<ActionResult> BulkUpdateMenuPermissions(int userId, [FromBody] List<MenuPermissionItemDto> menuItems)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request data", errors = ModelState });

            var dto = new BulkUpdateMenuPermissionsDto
            {
                UserId = userId,
                MenuItems = menuItems
            };

            var result = await _menuPermissionService.BulkUpdateMenuPermissionsAsync(dto);
            if (!result)
                return BadRequest(new { success = false, message = "Failed to update menu permissions" });

            return Ok(new { success = true, message = "Menu permissions updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk updating menu permissions for user {UserId}", userId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Initialize default menu permissions for a user
    /// </summary>
    [HttpPost("user/{userId}/initialize")]
    public async Task<ActionResult> InitializeDefaultMenuPermissions(int userId)
    {
        try
        {
            var result = await _menuPermissionService.InitializeDefaultMenuPermissionsForUserAsync(userId);
            if (!result)
                return BadRequest(new { success = false, message = "User already has menu permissions or user not found" });

            return Ok(new { success = true, message = "Default menu permissions initialized successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing default menu permissions for user {UserId}", userId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

