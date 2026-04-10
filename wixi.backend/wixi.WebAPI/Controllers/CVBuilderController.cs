using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.CVBuilder.DTOs;
using wixi.CVBuilder.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/cv-builder")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize]
public class CVBuilderController : ControllerBase
{
    private readonly ICVBuilderService _cvBuilderService;
    private readonly ILogger<CVBuilderController> _logger;

    public CVBuilderController(
        ICVBuilderService cvBuilderService,
        ILogger<CVBuilderController> logger)
    {
        _cvBuilderService = cvBuilderService;
        _logger = logger;
    }

    /// <summary>
    /// Save CV data
    /// </summary>
    [HttpPost("save")]
    public async Task<IActionResult> SaveCVData([FromBody] SaveCVDataDto dto)
    {
        try
        {
            // Get client ID from claims
            var clientIdClaim = User.FindFirst("ClientId");
            if (clientIdClaim == null || !int.TryParse(clientIdClaim.Value, out var clientId))
            {
                return Unauthorized(new { success = false, message = "Client ID not found in token" });
            }

            var result = await _cvBuilderService.SaveCVDataAsync(dto, clientId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving CV data. SessionId: {SessionId}", dto.SessionId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get CV data by session ID
    /// </summary>
    [HttpGet("session/{sessionId}")]
    public async Task<IActionResult> GetCVDataBySession(Guid sessionId)
    {
        try
        {
            var result = await _cvBuilderService.GetCVDataBySessionIdAsync(sessionId);
            if (result == null)
            {
                return NotFound(new { success = false, message = "CV data not found" });
            }
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving CV data. SessionId: {SessionId}", sessionId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get CV data by payment ID
    /// </summary>
    [HttpGet("payment/{paymentId}")]
    public async Task<IActionResult> GetCVDataByPayment(long paymentId)
    {
        try
        {
            var result = await _cvBuilderService.GetCVDataByPaymentIdAsync(paymentId);
            if (result == null)
            {
                return NotFound(new { success = false, message = "CV data not found" });
            }
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving CV data. PaymentId: {PaymentId}", paymentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update CV data
    /// </summary>
    [HttpPut("session/{sessionId}")]
    public async Task<IActionResult> UpdateCVData(Guid sessionId, [FromBody] SaveCVDataDto dto)
    {
        try
        {
            if (dto.SessionId != sessionId)
            {
                return BadRequest(new { success = false, message = "Session ID mismatch" });
            }

            var result = await _cvBuilderService.UpdateCVDataAsync(sessionId, dto);
            if (!result)
            {
                return NotFound(new { success = false, message = "CV data not found" });
            }
            return Ok(new { success = true, message = "CV data updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating CV data. SessionId: {SessionId}", sessionId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Export CV to PDF
    /// </summary>
    [HttpPost("export/{sessionId}")]
    public async Task<IActionResult> ExportCV(Guid sessionId)
    {
        try
        {
            var pdfBytes = await _cvBuilderService.ExportToPDFAsync(sessionId);
            return File(pdfBytes, "application/pdf", $"CV_{sessionId}.pdf");
        }
        catch (NotImplementedException)
        {
            return StatusCode(501, new { success = false, message = "PDF export not yet implemented" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting CV. SessionId: {SessionId}", sessionId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

