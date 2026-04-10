using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.Interfaces;
using wixi.Content.DTOs;
using wixi.Documents.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/team-members")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminTeamMembersController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<AdminTeamMembersController> _logger;

    public AdminTeamMembersController(
        IContentService contentService,
        IFileStorageService fileStorageService,
        ILogger<AdminTeamMembersController> logger)
    {
        _contentService = contentService;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    /// <summary>
    /// Get all team members (Admin only - includes inactive)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTeamMembers([FromQuery] bool activeOnly = false)
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
    /// Get team member by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
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

    /// <summary>
    /// Upload team member image (Admin only)
    /// </summary>
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "No file provided" });
            }

            // Validate file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var maxSizeBytes = 5 * 1024 * 1024; // 5MB
            var validation = await _fileStorageService.ValidateFileAsync(file, allowedExtensions, maxSizeBytes);
            
            if (!validation.IsValid)
            {
                var errorMessage = validation.Errors.Count > 0 
                    ? string.Join(", ", validation.Errors) 
                    : "File validation failed";
                return BadRequest(new { success = false, message = errorMessage });
            }

            // Upload file to TeamMembers directory (for compatibility with existing images)
            var uploadResult = await _fileStorageService.UploadFileAsync(file, "TeamMembers");
            
            if (!uploadResult.Success)
            {
                return BadRequest(new { success = false, message = uploadResult.ErrorMessage ?? "File upload failed" });
            }

            // Return URL in format /TeamMembers/xxx.jpg (FileStorageService now returns TeamMembers/xxx.jpg directly)
            var imageUrl = $"/{uploadResult.FilePath}";
            
            return Ok(new { 
                success = true, 
                message = "Image uploaded successfully",
                imageUrl = imageUrl,
                data = new {
                    url = imageUrl,
                    path = uploadResult.FilePath,
                    fileName = uploadResult.FileName
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading team member image");
            return StatusCode(500, new { success = false, message = "An error occurred while uploading image" });
        }
    }

    /// <summary>
    /// Delete team member image (Admin only)
    /// </summary>
    [HttpDelete("delete-image")]
    public async Task<IActionResult> DeleteImage([FromQuery] string imagePath)
    {
        try
        {
            if (string.IsNullOrEmpty(imagePath))
            {
                return BadRequest(new { success = false, message = "Image path is required" });
            }

            var result = await _fileStorageService.DeleteFileAsync(imagePath);
            
            if (!result)
            {
                return NotFound(new { success = false, message = "Image not found" });
            }

            return Ok(new { success = true, message = "Image deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting team member image");
            return StatusCode(500, new { success = false, message = "An error occurred while deleting image" });
        }
    }
}

