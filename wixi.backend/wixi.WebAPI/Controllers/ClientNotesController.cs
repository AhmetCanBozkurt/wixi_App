using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using wixi.Clients.DTOs;
using wixi.Clients.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/clients/{clientId}/notes")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class ClientNotesController : ControllerBase
{
    private readonly IClientNoteService _clientNoteService;
    private readonly ILogger<ClientNotesController> _logger;

    public ClientNotesController(
        IClientNoteService clientNoteService,
        ILogger<ClientNotesController> logger)
    {
        _clientNoteService = clientNoteService;
        _logger = logger;
    }

    /// <summary>
    /// Get all notes for a client
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetClientNotes(int clientId)
    {
        try
        {
            _logger.LogInformation("Getting notes for client {ClientId}", clientId);
            var notes = await _clientNoteService.GetClientNotesAsync(clientId);
            _logger.LogInformation("Found {Count} notes for client {ClientId}", notes.Count, clientId);
            return Ok(new { success = true, data = notes, count = notes.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notes for client {ClientId}", clientId);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific note by ID
    /// </summary>
    [HttpGet("{noteId}")]
    public async Task<ActionResult> GetClientNote(int clientId, int noteId)
    {
        try
        {
            var note = await _clientNoteService.GetClientNoteByIdAsync(noteId);
            if (note.ClientId != clientId)
            {
                return BadRequest(new { success = false, message = "Note does not belong to this client" });
            }
            return Ok(new { success = true, data = note });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving note {NoteId} for client {ClientId}", noteId, clientId);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new note for a client
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateClientNote(int clientId, [FromBody] CreateClientNoteDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Invalid request data", errors = ModelState });
            }

            // Get current user ID from claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { success = false, message = "User ID not found in token" });
            }

            if (dto.ClientId != clientId)
            {
                return BadRequest(new { success = false, message = "Client ID mismatch" });
            }

            var note = await _clientNoteService.CreateClientNoteAsync(clientId, dto, userId);
            return CreatedAtAction(
                nameof(GetClientNote),
                new { clientId, noteId = note.Id },
                new { success = true, data = note });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating note for client {ClientId}", clientId);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing note
    /// </summary>
    [HttpPut("{noteId}")]
    public async Task<ActionResult> UpdateClientNote(int clientId, int noteId, [FromBody] UpdateClientNoteDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Invalid request data", errors = ModelState });
            }

            var note = await _clientNoteService.UpdateClientNoteAsync(noteId, dto);
            if (note.ClientId != clientId)
            {
                return BadRequest(new { success = false, message = "Note does not belong to this client" });
            }
            return Ok(new { success = true, data = note });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating note {NoteId} for client {ClientId}", noteId, clientId);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a note
    /// </summary>
    [HttpDelete("{noteId}")]
    public async Task<ActionResult> DeleteClientNote(int clientId, int noteId)
    {
        try
        {
            // Verify note belongs to client
            var note = await _clientNoteService.GetClientNoteByIdAsync(noteId);
            if (note.ClientId != clientId)
            {
                return BadRequest(new { success = false, message = "Note does not belong to this client" });
            }

            await _clientNoteService.DeleteClientNoteAsync(noteId);
            return Ok(new { success = true, message = "Note deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting note {NoteId} for client {ClientId}", noteId, clientId);
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

