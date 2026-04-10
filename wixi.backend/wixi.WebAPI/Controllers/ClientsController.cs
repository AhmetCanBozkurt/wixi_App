using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.Clients.Interfaces;
using wixi.Clients.DTOs;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;
using wixi.DataAccess;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<ClientsController> _logger;
    private readonly WixiDbContext _context;

    public ClientsController(
        IClientService clientService,
        IAuditLogService auditLogService,
        ILogger<ClientsController> logger,
        WixiDbContext context)
    {
        _clientService = clientService;
        _auditLogService = auditLogService;
        _logger = logger;
        _context = context;
    }

    /// <summary>
    /// Create a new client profile
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateClient([FromBody] ClientDto createDto)
    {
        try
        {
            var result = await _clientService.CreateClientAsync(createDto);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "CLIENT_CREATED",
                    "Client",
                    result.Id.ToString(),
                    null,
                    new { result.Email, result.FirstName, result.LastName },
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Client profile created successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating client");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get client by ID
    /// </summary>
    [HttpGet("{clientId}")]
    public async Task<IActionResult> GetClient(int clientId)
    {
        try
        {
            var result = await _clientService.GetClientByIdAsync(clientId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting client {ClientId}", clientId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get client by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetClientByUser(int userId)
    {
        try
        {
            var result = await _clientService.GetClientByUserIdAsync(userId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting client for user {UserId}", userId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all clients (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> GetAllClients()
    {
        try
        {
            var result = await _clientService.GetAllClientsAsync();
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all clients");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update client profile
    /// </summary>
    [HttpPut("{clientId}")]
    public async Task<IActionResult> UpdateClient(int clientId, [FromBody] ClientDto updateDto)
    {
        try
        {
            var result = await _clientService.UpdateClientAsync(clientId, updateDto);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "CLIENT_UPDATED",
                    "Client",
                    clientId.ToString(),
                    null,
                    new { updateDto.Email, updateDto.FirstName, updateDto.LastName },
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Client profile updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating client {ClientId}", clientId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete client profile (Admin only)
    /// </summary>
    [HttpDelete("{clientId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteClient(int clientId)
    {
        try
        {
            await _clientService.DeleteClientAsync(clientId);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "CLIENT_DELETED",
                    "Client",
                    clientId.ToString(),
                    null,
                    null,
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Client profile deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting client {ClientId}", clientId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Add education info (Client can add to their own profile, Admin can add to any client)
    /// </summary>
    [HttpPost("education")]
    public async Task<IActionResult> AddEducationInfo([FromBody] EducationInfoDto createDto)
    {
        try
        {
            // Get current user ID from token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            // Check if user is admin
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
            
            if (!isAdmin)
            {
                // Client users can only add education info to their own profile
                var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == userId && c.DeletedAt == null);
                if (client == null || client.Id != createDto.ClientId)
                {
                    return Forbid("You can only add education info to your own profile");
                }
            }

            var result = await _clientService.AddEducationInfoAsync(createDto);
            
            // Audit log
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _auditLogService.LogAsync(
                userId,
                "EDUCATION_INFO_ADDED",
                "EducationInfo",
                result.Id.ToString(),
                null,
                new { result.ClientId, result.Degree, result.Institution },
                ipAddress,
                HttpContext.Request.Headers["User-Agent"].ToString());
            
            return Ok(new { success = true, message = "Education info added successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding education info");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update education info (Client can update their own, Admin can update any)
    /// </summary>
    [HttpPut("education/{educationInfoId}")]
    public async Task<IActionResult> UpdateEducationInfo(int educationInfoId, [FromBody] EducationInfoDto updateDto)
    {
        try
        {
            // Get current user ID from token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            // Check if user is admin
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
            
            if (!isAdmin)
            {
                // Client users can only update their own education info
                var educationInfo = await _context.EducationInfos
                    .Include(e => e.Client)
                    .FirstOrDefaultAsync(e => e.Id == educationInfoId);
                
                if (educationInfo == null)
                {
                    return NotFound(new { success = false, message = "Education info not found" });
                }

                var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == userId && c.DeletedAt == null);
                if (client == null || client.Id != educationInfo.ClientId)
                {
                    return Forbid("You can only update your own education info");
                }
            }

            var result = await _clientService.UpdateEducationInfoAsync(educationInfoId, updateDto);
            
            // Audit log
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _auditLogService.LogAsync(
                userId,
                "EDUCATION_INFO_UPDATED",
                "EducationInfo",
                educationInfoId.ToString(),
                null,
                new { updateDto.Degree, updateDto.Institution },
                ipAddress,
                HttpContext.Request.Headers["User-Agent"].ToString());
            
            return Ok(new { success = true, message = "Education info updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating education info {EducationInfoId}", educationInfoId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete education info (Client can delete their own, Admin can delete any)
    /// </summary>
    [HttpDelete("education/{educationInfoId}")]
    public async Task<IActionResult> DeleteEducationInfo(int educationInfoId)
    {
        try
        {
            // Get current user ID from token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            // Check if user is admin
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
            
            if (!isAdmin)
            {
                // Client users can only delete their own education info
                var educationInfo = await _context.EducationInfos
                    .Include(e => e.Client)
                    .FirstOrDefaultAsync(e => e.Id == educationInfoId);
                
                if (educationInfo == null)
                {
                    return NotFound(new { success = false, message = "Education info not found" });
                }

                var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == userId && c.DeletedAt == null);
                if (client == null || client.Id != educationInfo.ClientId)
                {
                    return Forbid("You can only delete your own education info");
                }
            }

            await _clientService.DeleteEducationInfoAsync(educationInfoId);
            
            // Audit log
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _auditLogService.LogAsync(
                userId,
                "EDUCATION_INFO_DELETED",
                "EducationInfo",
                educationInfoId.ToString(),
                null,
                null,
                ipAddress,
                HttpContext.Request.Headers["User-Agent"].ToString());
            
            return Ok(new { success = true, message = "Education info deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting education info {EducationInfoId}", educationInfoId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get client education history
    /// </summary>
    [HttpGet("{clientId}/education")]
    public async Task<IActionResult> GetClientEducationHistory(int clientId)
    {
        try
        {
            var result = await _clientService.GetClientEducationHistoryAsync(clientId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting education history for client {ClientId}", clientId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all education types (Public endpoint for registration)
    /// </summary>
    [HttpGet("education-types")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEducationTypes()
    {
        try
        {
            var educationTypes = await _context.EducationTypes
                .Where(et => et.IsActive)
                .OrderBy(et => et.DisplayOrder)
                .Select(et => new
                {
                    et.Id,
                    et.Code,
                    et.Name_TR,
                    et.Name_EN,
                    et.Name_DE,
                    et.Name_AR,
                    et.Description_TR,
                    et.Description_EN,
                    et.Description_DE,
                    et.Description_AR,
                    et.DisplayOrder,
                    et.IconName,
                    et.IsActive
                })
                .ToListAsync();

            return Ok(new { success = true, data = educationTypes });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting education types");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get pending client code information by client code (Public endpoint for registration)
    /// </summary>
    [HttpGet("pending-code/{clientCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPendingClientCodeByCode(string clientCode)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(clientCode))
            {
                return BadRequest(new { success = false, message = "Client code is required" });
            }

            var pendingCode = await _context.PendingClientCodes
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ClientCode == clientCode);

            if (pendingCode == null)
            {
                return NotFound(new { success = false, message = "Client code not found" });
            }

            // Check if code is valid (not used and not expired)
            var isExpired = pendingCode.ExpirationDate < DateTime.UtcNow;
            var isValid = !pendingCode.IsUsed && !isExpired;

            // Parse FullName to firstName and lastName
            var nameParts = pendingCode.FullName?.Split(' ', 2) ?? new[] { "", "" };
            var firstName = nameParts[0] ?? "";
            var lastName = nameParts.Length > 1 ? nameParts[1] : "";

            return Ok(new
            {
                success = true,
                data = new
                {
                    clientCode = pendingCode.ClientCode,
                    email = pendingCode.Email,
                    fullName = pendingCode.FullName,
                    firstName = firstName,
                    lastName = lastName,
                    expirationDate = pendingCode.ExpirationDate,
                    isUsed = pendingCode.IsUsed,
                    isExpired = isExpired,
                    isValid = isValid,
                    employeeSubmissionId = pendingCode.EmployeeSubmissionId
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending client code for code: {ClientCode}", clientCode);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

