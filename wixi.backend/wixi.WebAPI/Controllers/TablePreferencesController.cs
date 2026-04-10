using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using wixi.Identity.DTOs;
using wixi.Identity.Interfaces;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/user/table-preferences")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize]
public class TablePreferencesController : ControllerBase
{
    private readonly ITablePreferenceService _tablePreferenceService;
    private readonly ILogger<TablePreferencesController> _logger;

    public TablePreferencesController(
        ITablePreferenceService tablePreferenceService,
        ILogger<TablePreferencesController> logger)
    {
        _tablePreferenceService = tablePreferenceService;
        _logger = logger;
    }

    [HttpGet("tables/{tableKey}")]
    public async Task<ActionResult<TablePreferenceDto>> GetTablePreference(string tableKey)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var preference = await _tablePreferenceService.GetAsync(userId.Value, tableKey);
            if (preference == null)
            {
                return Ok(new TablePreferenceDto
                {
                    TableKey = tableKey
                });
            }

            return Ok(preference);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving table preference for {TableKey}", tableKey);
            return StatusCode(500, new { success = false, message = "Table preference could not be retrieved." });
        }
    }

    [HttpPut("tables/{tableKey}")]
    public async Task<ActionResult<TablePreferenceDto>> UpsertTablePreference(string tableKey, [FromBody] UpdateTablePreferenceDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        dto.TableKey = tableKey;

        try
        {
            var result = await _tablePreferenceService.UpsertAsync(userId.Value, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving table preference for {TableKey}", tableKey);
            return StatusCode(500, new { success = false, message = "Table preference could not be saved." });
        }
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return null;
        }

        return userId;
    }
}

