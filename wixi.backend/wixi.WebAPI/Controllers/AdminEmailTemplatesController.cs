using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Email.DTOs;
using wixi.Email.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/email-templates")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminEmailTemplatesController : ControllerBase
{
    private readonly IEmailTemplateService _templateService;
    private readonly ILogger<AdminEmailTemplatesController> _logger;

    public AdminEmailTemplatesController(
        IEmailTemplateService templateService,
        ILogger<AdminEmailTemplatesController> logger)
    {
        _templateService = templateService;
        _logger = logger;
    }

    /// <summary>
    /// Get all email templates
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAllTemplates()
    {
        try
        {
            var templates = await _templateService.GetAllAsync();
            return Ok(new { success = true, items = templates });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching email templates");
            return StatusCode(500, new { success = false, message = "Error fetching email templates" });
        }
    }

    /// <summary>
    /// Get email template by key
    /// </summary>
    [HttpGet("{key}")]
    public async Task<ActionResult> GetTemplateByKey(string key)
    {
        try
        {
            var template = await _templateService.GetByKeyAsync(key);
            if (template == null)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }
            return Ok(new { success = true, item = template });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching email template: {Key}", key);
            return StatusCode(500, new { success = false, message = "Error fetching email template" });
        }
    }

    /// <summary>
    /// Create or update email template
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> UpsertTemplate([FromBody] EmailTemplateDto dto)
    {
        try
        {
            var template = await _templateService.UpsertAsync(dto, User?.Identity?.Name);
            return Ok(new { success = true, item = template });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting email template");
            return StatusCode(500, new { success = false, message = "Error upserting email template" });
        }
    }

    /// <summary>
    /// Delete email template
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTemplate(int id)
    {
        try
        {
            var deleted = await _templateService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }
            return Ok(new { success = true, message = "Template deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting email template: {Id}", id);
            return StatusCode(500, new { success = false, message = "Error deleting email template" });
        }
    }
}

