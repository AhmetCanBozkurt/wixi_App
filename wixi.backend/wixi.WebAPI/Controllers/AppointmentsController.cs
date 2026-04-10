using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using wixi.Appointments.DTOs;
using wixi.Appointments.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly ILogger<AppointmentsController> _logger;

    public AppointmentsController(
        IAppointmentService appointmentService,
        ILogger<AppointmentsController> logger)
    {
        _appointmentService = appointmentService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new appointment (Public - no authentication required)
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
    {
        try
        {
            // For public appointments, CreatedById can be null or we can get it from token if available
            int? createdById = null;
            
            // Try to get user ID from token if authenticated
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                createdById = userId;
            }

            var appointment = await _appointmentService.CreateAppointmentAsync(dto, createdById);
            return Ok(new { success = true, data = appointment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating appointment");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get appointment by ID
    /// </summary>
    [HttpGet("{appointmentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAppointment(long appointmentId)
    {
        try
        {
            var appointment = await _appointmentService.GetAppointmentByIdAsync(appointmentId);
            if (appointment == null)
            {
                return NotFound(new { success = false, message = "Appointment not found" });
            }
            return Ok(new { success = true, data = appointment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointment {AppointmentId}", appointmentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get appointments by date range (Public)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAppointments([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var appointments = await _appointmentService.GetAppointmentsAsync(startDate, endDate);
            return Ok(new { success = true, data = appointments, count = appointments.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointments");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get appointments by date range
    /// </summary>
    [HttpGet("range")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAppointmentsByRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var appointments = await _appointmentService.GetAppointmentsByDateRangeAsync(startDate, endDate);
            return Ok(new { success = true, data = appointments, count = appointments.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointments by range");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get appointments by client ID
    /// </summary>
    [HttpGet("client/{clientId}")]
    [Authorize]
    public async Task<IActionResult> GetAppointmentsByClient(int clientId)
    {
        try
        {
            var appointments = await _appointmentService.GetAppointmentsByClientAsync(clientId);
            return Ok(new { success = true, data = appointments, count = appointments.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointments for client {ClientId}", clientId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update appointment (Admin only)
    /// </summary>
    [HttpPut("{appointmentId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpdateAppointment(long appointmentId, [FromBody] UpdateAppointmentDto dto)
    {
        try
        {
            var appointment = await _appointmentService.UpdateAppointmentAsync(appointmentId, dto);
            return Ok(new { success = true, data = appointment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating appointment {AppointmentId}", appointmentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete appointment (Admin only)
    /// </summary>
    [HttpDelete("{appointmentId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteAppointment(long appointmentId)
    {
        try
        {
            var result = await _appointmentService.DeleteAppointmentAsync(appointmentId);
            return Ok(new { success = true, message = "Appointment deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting appointment {AppointmentId}", appointmentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get holidays
    /// </summary>
    [HttpGet("holidays")]
    [AllowAnonymous]
    public async Task<IActionResult> GetHolidays([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var holidays = await _appointmentService.GetHolidaysAsync(startDate, endDate);
            return Ok(new { success = true, data = holidays, count = holidays.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting holidays");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Create holiday (Admin only)
    /// </summary>
    [HttpPost("holidays")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> CreateHoliday([FromBody] CreateHolidayDto dto)
    {
        try
        {
            var holiday = await _appointmentService.CreateHolidayAsync(dto);
            return Ok(new { success = true, data = holiday });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating holiday");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update holiday (Admin only)
    /// </summary>
    [HttpPut("holidays/{holidayId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> UpdateHoliday(long holidayId, [FromBody] UpdateHolidayDto dto)
    {
        try
        {
            var holiday = await _appointmentService.UpdateHolidayAsync(holidayId, dto);
            return Ok(new { success = true, data = holiday });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating holiday {HolidayId}", holidayId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete holiday (Admin only)
    /// </summary>
    [HttpDelete("holidays/{holidayId}")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> DeleteHoliday(long holidayId)
    {
        try
        {
            var result = await _appointmentService.DeleteHolidayAsync(holidayId);
            return Ok(new { success = true, message = "Holiday deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting holiday {HolidayId}", holidayId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

