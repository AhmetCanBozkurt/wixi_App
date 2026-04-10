using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.Interfaces;
using wixi.Content.DTOs;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/team-members")]
[Asp.Versioning.ApiVersion("1.0")]
public class TeamMembersController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly ILogger<TeamMembersController> _logger;

    public TeamMembersController(IContentService contentService, ILogger<TeamMembersController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    /// <summary>
    /// Get all active team members (public)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetTeamMembers([FromQuery] bool activeOnly = true)
    {
        try
        {
            var result = await _contentService.GetAllTeamMembersAsync(activeOnly);
            return Ok(new { success = true, items = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching team members");
            return StatusCode(500, new { success = false, message = "An error occurred while fetching team members" });
        }
    }

    /// <summary>
    /// Get team member by ID (public)
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTeamMemberById(int id)
    {
        try
        {
            var result = await _contentService.GetTeamMemberByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { success = false, message = "Team member not found" });
            }
            return Ok(new { success = true, item = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching team member by ID: {Id}", id);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching team member" });
        }
    }

    /// <summary>
    /// Create team member (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> CreateTeamMember([FromBody] TeamMemberDto dto)
    {
        try
        {
            var result = await _contentService.CreateTeamMemberAsync(dto);
            return Ok(new { success = true, message = "Team member created successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating team member");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update team member (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpdateTeamMember(int id, [FromBody] TeamMemberDto dto)
    {
        try
        {
            var result = await _contentService.UpdateTeamMemberAsync(id, dto);
            return Ok(new { success = true, message = "Team member updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team member {Id}", id);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete team member (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteTeamMember(int id)
    {
        try
        {
            var result = await _contentService.DeleteTeamMemberAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Team member not found" });
            }
            return Ok(new { success = true, message = "Team member deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting team member {Id}", id);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

