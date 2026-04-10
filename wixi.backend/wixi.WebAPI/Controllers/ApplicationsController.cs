using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.Applications.Interfaces;
using wixi.Applications.DTOs;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;
using wixi.DataAccess;
using wixi.Clients.Entities;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;
    private readonly IAuditLogService _auditLogService;
    private readonly WixiDbContext _context;
    private readonly ILogger<ApplicationsController> _logger;

    public ApplicationsController(
        IApplicationService applicationService,
        IAuditLogService auditLogService,
        WixiDbContext context,
        ILogger<ApplicationsController> logger)
    {
        _applicationService = applicationService;
        _auditLogService = auditLogService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a new application for a client
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateApplication([FromBody] ApplicationDto createDto)
    {
        try
        {
            var result = await _applicationService.CreateApplicationAsync(createDto);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "APPLICATION_CREATED",
                    "Application",
                    result.Id.ToString(),
                    null,
                    new { result.ClientId, result.ApplicationTemplateId },
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Application created successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating application");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get application by ID with full details
    /// </summary>
    [HttpGet("{applicationId}")]
    public async Task<IActionResult> GetApplication(long applicationId)
    {
        try
        {
            var result = await _applicationService.GetApplicationByIdAsync(applicationId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application {ApplicationId}", applicationId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all applications for a client
    /// </summary>
    [HttpGet("client/{clientId}")]
    public async Task<IActionResult> GetClientApplications(int clientId)
    {
        try
        {
            var result = await _applicationService.GetClientApplicationsAsync(clientId);
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving applications for client {ClientId}", clientId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all applications (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> GetAllApplications()
    {
        try
        {
            var result = await _applicationService.GetAllApplicationsAsync();
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all applications");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update application
    /// </summary>
    [HttpPut("{applicationId}")]
    public async Task<IActionResult> UpdateApplication(long applicationId, [FromBody] ApplicationDto updateDto)
    {
        try
        {
            var result = await _applicationService.UpdateApplicationAsync(applicationId, updateDto);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "APPLICATION_UPDATED",
                    "Application",
                    applicationId.ToString(),
                    null,
                    null,
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Application updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating application {ApplicationId}", applicationId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an application (Admin only)
    /// </summary>
    [HttpDelete("{applicationId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteApplication(long applicationId)
    {
        try
        {
            await _applicationService.DeleteApplicationAsync(applicationId);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "APPLICATION_DELETED",
                    "Application",
                    applicationId.ToString(),
                    null,
                    null,
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Application deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting application {ApplicationId}", applicationId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all application templates
    /// </summary>
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        try
        {
            var result = await _applicationService.GetAllTemplatesAsync();
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application templates");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get template by ID with steps
    /// </summary>
    [HttpGet("templates/{templateId}")]
    public async Task<IActionResult> GetTemplate(int templateId)
    {
        try
        {
            var result = await _applicationService.GetTemplateByIdAsync(templateId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving template {TemplateId}", templateId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update step status (Admin/Staff)
    /// </summary>
    [HttpPut("steps/{stepId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpdateStep(long stepId, [FromBody] StepUpdateDto updateDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value) || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            _logger.LogInformation("Admin {UserId} updating step {StepId}", userId, stepId);

            var result = await _applicationService.UpdateStepAsync(stepId, updateDto, userId);

            // Audit log
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _auditLogService.LogAsync(
                userId,
                "STEP_UPDATED",
                "ApplicationStep",
                stepId.ToString(),
                null,
                new { updateDto.Status, updateDto.Notes },
                ipAddress,
                HttpContext.Request.Headers["User-Agent"].ToString());

            return Ok(new { success = true, message = "Step updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating step {StepId}", stepId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update sub-step completion status (Admin or Client for own application)
    /// </summary>
    [HttpPut("sub-steps/{subStepId}")]
    [Authorize] // Allow both Admin and Client, but check ownership in code
    public async Task<IActionResult> UpdateSubStep(long subStepId, [FromBody] SubStepUpdateDto updateDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value) || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            var isAdmin = User.IsInRole("Admin");
            
            // If not admin, verify that the sub-step belongs to the client's application
            if (!isAdmin)
            {
                // Get sub-step with application and client info
                var subStep = await _context.ApplicationSubSteps
                    .Include(ss => ss.Step)
                        .ThenInclude(s => s.Application)
                    .FirstOrDefaultAsync(ss => ss.Id == subStepId);
                
                if (subStep == null)
                {
                    return NotFound(new { success = false, message = "Sub-step not found" });
                }

                // Get client by user ID
                var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
                if (client == null || subStep.Step.Application.ClientId != client.Id)
                {
                    return StatusCode(403, new { success = false, message = "You can only update sub-steps for your own application" });
                }
            }

            _logger.LogInformation("User {UserId} (Admin: {IsAdmin}) updating sub-step {SubStepId}", userId, isAdmin, subStepId);

            var result = await _applicationService.UpdateSubStepAsync(subStepId, updateDto, userId);

            // Audit log
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _auditLogService.LogAsync(
                userId,
                "SUBSTEP_UPDATED",
                "ApplicationSubStep",
                subStepId.ToString(),
                null,
                new { updateDto.Status, updateDto.Notes },
                ipAddress,
                HttpContext.Request.Headers["User-Agent"].ToString());

            return Ok(new { success = true, message = "Sub-step updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sub-step {SubStepId}", subStepId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }
}

