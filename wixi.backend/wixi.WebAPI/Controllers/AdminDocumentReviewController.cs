using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Documents.Entities;
using wixi.Documents.Interfaces;
using wixi.Documents.DTOs;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/document-review")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminDocumentReviewController : ControllerBase
{
    private readonly IDocumentReviewService _documentReviewService;
    private readonly IDocumentService _documentService;
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminDocumentReviewController> _logger;

    public AdminDocumentReviewController(
        IDocumentReviewService documentReviewService,
        IDocumentService documentService,
        WixiDbContext context,
        ILogger<AdminDocumentReviewController> logger)
    {
        _documentReviewService = documentReviewService;
        _documentService = documentService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get pending documents for review
    /// </summary>
    [HttpGet("pending")]
    public async Task<ActionResult> GetPendingDocuments()
    {
        try
        {
            var documents = await _documentReviewService.GetPendingDocumentsAsync();
            return Ok(new { success = true, data = documents });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching pending documents");
            return StatusCode(500, new { success = false, message = "Error fetching pending documents" });
        }
    }

    /// <summary>
    /// Get documents by status
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult> GetDocumentsByStatus(string status)
    {
        try
        {
            var documents = await _documentReviewService.GetDocumentsByStatusAsync(status);
            return Ok(new { success = true, data = documents });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching documents by status {Status}", status);
            return StatusCode(500, new { success = false, message = $"Error fetching documents with status {status}" });
        }
    }

    /// <summary>
    /// Review a document
    /// </summary>
    [HttpPost("{documentId}/review")]
    public async Task<ActionResult> ReviewDocument(long documentId, [FromBody] DocumentReviewDto reviewDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var reviewerId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            var document = await _documentReviewService.ReviewDocumentAsync(documentId, reviewDto, reviewerId);
            return Ok(new { success = true, message = "Document reviewed successfully", data = document });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reviewing document {DocumentId}", documentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get document review history
    /// </summary>
    [HttpGet("{documentId}/history")]
    public async Task<ActionResult> GetDocumentReviewHistory(long documentId)
    {
        try
        {
            var history = await _documentReviewService.GetDocumentReviewHistoryAsync(documentId);
            return Ok(new { success = true, data = history });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching review history for document {DocumentId}", documentId);
            return StatusCode(500, new { success = false, message = "Error fetching review history" });
        }
    }

    /// <summary>
    /// Get document review statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetReviewStatistics()
    {
        try
        {
            var totalDocuments = await _context.Documents.CountAsync(d => d.DeletedAt == null);
            var pendingDocuments = await _context.Documents.CountAsync(d => d.Status == DocumentStatus.Pending && d.DeletedAt == null);
            var approvedDocuments = await _context.Documents.CountAsync(d => d.Status == DocumentStatus.Accepted && d.DeletedAt == null);
            var rejectedDocuments = await _context.Documents.CountAsync(d => d.Status == DocumentStatus.Rejected && d.DeletedAt == null);
            var missingInfoDocuments = await _context.Documents.CountAsync(d => d.Status == DocumentStatus.MissingInfo && d.DeletedAt == null);

            var stats = new
            {
                totalDocuments = totalDocuments,
                pendingForReview = pendingDocuments,
                accepted = approvedDocuments,
                rejected = rejectedDocuments,
                missingInfo = missingInfoDocuments
            };

            return Ok(new { success = true, data = stats });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching review statistics");
            return StatusCode(500, new { success = false, message = "Error fetching review statistics" });
        }
    }

    /// <summary>
    /// Upload document for a client (Admin uploads on behalf of client, e.g., Denklik Belgesi)
    /// This will:
    /// 1. Upload the document
    /// 2. Mark it as Accepted
    /// 3. Complete Step 1 (Denklik İşlemleri) if document is "denklik_belgesi"
    /// 4. Start Step 2, SubStep 1 (İş Bulma ve Çalışma İzni İşlemleri)
    /// 5. Send email notification to client
    /// </summary>
    [HttpPost("upload-for-client")]
    public async Task<ActionResult> UploadDocumentForClient(
        [FromForm] int clientId,
        [FromForm] string documentTypeCode,  // e.g., "denklik_belgesi"
        IFormFile file,
        [FromForm] string? notes)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var adminUserId))
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "File is required" });
            }

            _logger.LogInformation("Admin {AdminUserId} uploading {DocumentType} for client {ClientId}",
                adminUserId, documentTypeCode, clientId);

            var document = await _documentService.UploadDocumentForClientAsync(
                clientId,
                documentTypeCode,
                file,
                adminUserId,
                notes);

            return Ok(new 
            { 
                success = true, 
                message = "Document uploaded successfully and client notified", 
                data = document 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document for client {ClientId}", clientId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

