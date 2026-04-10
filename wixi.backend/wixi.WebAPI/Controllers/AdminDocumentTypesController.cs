using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using wixi.Documents.DTOs;
using wixi.Documents.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/document-types")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminDocumentTypesController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly ILogger<AdminDocumentTypesController> _logger;

    public AdminDocumentTypesController(
        IDocumentService documentService,
        ILogger<AdminDocumentTypesController> logger)
    {
        _documentService = documentService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        try
        {
            var items = await _documentService.GetAllDocumentTypesAsync();
            return Ok(new { success = true, data = items });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching document types (admin)");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { success = false, message = "Belge türleri alınırken hata oluştu" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] DocumentTypeDto documentTypeDto)
    {
        try
        {
            var created = await _documentService.CreateDocumentTypeAsync(documentTypeDto);
            return Ok(new { success = true, data = created });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Duplicate document type code detected while creating");
            return Conflict(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating document type");
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating document type");
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { success = false, message = "Belge türü oluşturulurken hata oluştu" });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] DocumentTypeDto documentTypeDto)
    {
        try
        {
            var updated = await _documentService.UpdateDocumentTypeAsync(id, documentTypeDto);
            return Ok(new { success = true, data = updated });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { success = false, message = "Belge türü bulunamadı" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Duplicate document type code detected while updating");
            return Conflict(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while updating document type");
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating document type {DocumentTypeId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { success = false, message = "Belge türü güncellenirken hata oluştu" });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            await _documentService.DeleteDocumentTypeAsync(id);
            return Ok(new { success = true });
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { success = false, message = "Belge türü bulunamadı" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document type {DocumentTypeId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { success = false, message = "Belge türü silinirken hata oluştu" });
        }
    }
}

