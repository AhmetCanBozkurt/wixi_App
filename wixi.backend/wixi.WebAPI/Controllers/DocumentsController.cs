using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Documents.Interfaces;
using wixi.Documents.DTOs;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IDocumentAnalysisService _documentAnalysisService;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(
        IDocumentService documentService,
        IDocumentAnalysisService documentAnalysisService,
        IAuditLogService auditLogService,
        ILogger<DocumentsController> logger)
    {
        _documentService = documentService;
        _documentAnalysisService = documentAnalysisService;
        _auditLogService = auditLogService;
        _logger = logger;
    }

    /// <summary>
    /// Upload a document for a client
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadDocument([FromForm] int clientId, [FromForm] int documentTypeId, IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "File is required" });
            }

            var result = await _documentService.UploadDocumentAsync(clientId, documentTypeId, file);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "DOCUMENT_UPLOADED",
                    "Document",
                    result.Id.ToString(),
                    null,
                    new { result.OriginalFileName, result.DocumentTypeId },
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Document uploaded successfully", data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document for client {ClientId}", clientId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all documents for a client
    /// </summary>
    [HttpGet("client/{clientId}")]
    public async Task<IActionResult> GetClientDocuments(int clientId)
    {
        try
        {
            var result = await _documentService.GetClientDocumentsAsync(clientId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving documents for client {ClientId}", clientId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get document by ID
    /// </summary>
    [HttpGet("{documentId}")]
    public async Task<IActionResult> GetDocument(long documentId)
    {
        try
        {
            var result = await _documentService.GetDocumentByIdAsync(documentId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document {DocumentId}", documentId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a document
    /// </summary>
    [HttpDelete("{documentId}")]
    public async Task<IActionResult> DeleteDocument(long documentId, [FromQuery] int clientId)
    {
        try
        {
            await _documentService.DeleteDocumentAsync(documentId, clientId);
            
            // Audit log
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _auditLogService.LogAsync(
                    userId,
                    "DOCUMENT_DELETED",
                    "Document",
                    documentId.ToString(),
                    null,
                    null,
                    ipAddress,
                    HttpContext.Request.Headers["User-Agent"].ToString());
            }
            
            return Ok(new { success = true, message = "Document deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId}", documentId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Download a document
    /// </summary>
    [HttpGet("download/{documentId}")]
    public async Task<IActionResult> DownloadDocument(long documentId)
    {
        try
        {
            var (stream, fileName, contentType) = await _documentService.DownloadDocumentAsync(documentId);
            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading document {DocumentId}", documentId);
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all document types
    /// </summary>
    [HttpGet("types")]
    public async Task<IActionResult> GetDocumentTypes()
    {
        try
        {
            var result = await _documentService.GetAllDocumentTypesAsync();
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document types");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get document types by education type
    /// </summary>
    [HttpGet("types/education/{educationTypeId}")]
    public async Task<IActionResult> GetDocumentTypesByEducation(int educationTypeId)
    {
        try
        {
            var result = await _documentService.GetDocumentTypesByEducationAsync(educationTypeId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document types for education type {EducationTypeId}", educationTypeId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Analyze a document (CV detection and ATS score)
    /// </summary>
    [HttpGet("{documentId}/analysis")]
    public async Task<IActionResult> AnalyzeDocument(long documentId)
    {
        try
        {
            var result = await _documentAnalysisService.AnalyzeDocumentAsync(documentId);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing document {DocumentId}", documentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get document analysis by document ID
    /// </summary>
    [HttpGet("{documentId}/analysis/result")]
    public async Task<IActionResult> GetDocumentAnalysis(long documentId)
    {
        try
        {
            var result = await _documentAnalysisService.GetAnalysisByDocumentIdAsync(documentId);
            if (result == null)
            {
                return NotFound(new { success = false, message = "Analysis not found" });
            }
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving analysis for document {DocumentId}", documentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

