using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Support.Interfaces;
using wixi.Support.DTOs;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly ISupportService _supportService;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<SupportController> _logger;

    public SupportController(
        ISupportService supportService,
        IAuditLogService auditLogService,
        ILogger<SupportController> logger)
    {
        _supportService = supportService;
        _auditLogService = auditLogService;
        _logger = logger;
    }

    #region Ticket Operations

    /// <summary>
    /// Create a support ticket
    /// </summary>
    [HttpPost("tickets")]
    public async Task<IActionResult> CreateTicket([FromBody] SupportTicketDto createDto)
    {
        try
        {
            var result = await _supportService.CreateTicketAsync(createDto);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "SUPPORT_TICKET_CREATED",
                    "SupportTicket",
                    result.Id.ToString(),
                    null,
                    new { result.Subject, result.Priority },
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Ticket created successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating ticket");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get ticket by ID
    /// </summary>
    [HttpGet("tickets/{ticketId}")]
    public async Task<IActionResult> GetTicket(long ticketId)
    {
        try
        {
            var result = await _supportService.GetTicketByIdAsync(ticketId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket {TicketId}", ticketId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all tickets for a client
    /// </summary>
    [HttpGet("tickets/client/{clientId}")]
    public async Task<IActionResult> GetClientTickets(int clientId)
    {
        try
        {
            var result = await _supportService.GetClientTicketsAsync(clientId);
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tickets for client {ClientId}", clientId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all tickets (Admin only)
    /// </summary>
    [HttpGet("tickets")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> GetAllTickets()
    {
        try
        {
            var result = await _supportService.GetAllTicketsAsync();
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all tickets");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update ticket (Admin only)
    /// </summary>
    [HttpPut("tickets/{ticketId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpdateTicket(long ticketId, [FromBody] SupportTicketDto updateDto)
    {
        try
        {
            var result = await _supportService.UpdateTicketAsync(ticketId, updateDto);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "SUPPORT_TICKET_UPDATED",
                    "SupportTicket",
                    ticketId.ToString(),
                    null,
                    new { updateDto.Status, updateDto.Priority },
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Ticket updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating ticket {TicketId}", ticketId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete ticket (Admin only)
    /// </summary>
    [HttpDelete("tickets/{ticketId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteTicket(long ticketId)
    {
        try
        {
            await _supportService.DeleteTicketAsync(ticketId);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "SUPPORT_TICKET_DELETED",
                    "SupportTicket",
                    ticketId.ToString(),
                    null,
                    null,
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Ticket deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting ticket {TicketId}", ticketId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    #endregion

    #region Message Operations

    /// <summary>
    /// Add a message to a ticket
    /// </summary>
    [HttpPost("messages")]
    public async Task<IActionResult> AddMessage([FromBody] CreateSupportMessageDto messageDto)
    {
        try
        {
            // Get current user ID from token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            // Create SupportMessageDto from CreateSupportMessageDto
            var supportMessageDto = new SupportMessageDto
            {
                TicketId = messageDto.TicketId,
                SenderId = userId, // Use authenticated user ID, not the one from request
                Message = messageDto.Message,
                IsFromClient = messageDto.IsFromClient
            };

            var result = await _supportService.AddMessageAsync(supportMessageDto);
            
            // Audit log
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _auditLogService.LogAsync(
                userId,
                "SUPPORT_MESSAGE_ADDED",
                "SupportMessage",
                result.Id.ToString(),
                null,
                new { result.TicketId, IsFromClient = messageDto.IsFromClient },
                ipAddress,
                HttpContext.Request.Headers["User-Agent"].ToString());
            
            return Ok(new { success = true, message = "Message added successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding message");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all messages for a ticket
    /// </summary>
    [HttpGet("tickets/{ticketId}/messages")]
    public async Task<IActionResult> GetTicketMessages(long ticketId)
    {
        try
        {
            var result = await _supportService.GetTicketMessagesAsync(ticketId);
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting messages for ticket {TicketId}", ticketId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    #endregion

    #region FAQ Operations

    /// <summary>
    /// Get all FAQs (Public)
    /// </summary>
    [HttpGet("faqs")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllFAQs()
    {
        try
        {
            var result = await _supportService.GetAllFAQsAsync();
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting FAQs");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get FAQs by category (Public)
    /// </summary>
    [HttpGet("faqs/category/{category}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFAQsByCategory(string category)
    {
        try
        {
            var result = await _supportService.GetFAQsByCategoryAsync(category);
            return Ok(new { success = true, data = result, count = result.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting FAQs for category {Category}", category);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Create FAQ (Admin only)
    /// </summary>
    [HttpPost("faqs")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> CreateFAQ([FromBody] FAQDto createDto)
    {
        try
        {
            var result = await _supportService.CreateFAQAsync(createDto);
            return Ok(new { success = true, message = "FAQ created successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating FAQ");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update FAQ (Admin only)
    /// </summary>
    [HttpPut("faqs/{faqId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpdateFAQ(int faqId, [FromBody] FAQDto updateDto)
    {
        try
        {
            var result = await _supportService.UpdateFAQAsync(faqId, updateDto);
            return Ok(new { success = true, message = "FAQ updated successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating FAQ {FaqId}", faqId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete FAQ (Admin only)
    /// </summary>
    [HttpDelete("faqs/{faqId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteFAQ(int faqId)
    {
        try
        {
            await _supportService.DeleteFAQAsync(faqId);
            return Ok(new { success = true, message = "FAQ deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting FAQ {FaqId}", faqId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    #endregion
}

