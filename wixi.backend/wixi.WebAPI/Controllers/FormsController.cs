using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Forms.DTOs;
using wixi.Forms.Interfaces;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public class FormsController : ControllerBase
{
    private readonly IFormService _formService;
    private readonly ILogger<FormsController> _logger;

    public FormsController(IFormService formService, ILogger<FormsController> logger)
    {
        _formService = formService;
        _logger = logger;
    }

    #region Employer Forms

    /// <summary>
    /// Submit employer form (job posting)
    /// Public endpoint - no authentication required
    /// </summary>
    [HttpPost("employer")]
    [AllowAnonymous]
    public async Task<ActionResult<EmployerFormDto>> SubmitEmployerForm([FromBody] SubmitEmployerFormDto dto)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var result = await _formService.SubmitEmployerFormAsync(dto, ipAddress, userAgent);
        
        _logger.LogInformation("Employer form submitted: {CompanyName}, Email: {Email}", 
            dto.CompanyName, dto.Email);
        
        return Ok(result);
    }

    /// <summary>
    /// Get employer form by ID (Admin only)
    /// </summary>
    [HttpGet("employer/{id}")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<ActionResult<EmployerFormDto>> GetEmployerForm(int id)
    {
        var form = await _formService.GetEmployerFormByIdAsync(id);
        if (form == null)
            return NotFound();
        
        return Ok(form);
    }

    /// <summary>
    /// Get all employer forms (Admin only)
    /// </summary>
    [HttpGet("employer")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<ActionResult<List<EmployerFormDto>>> GetAllEmployerForms()
    {
        var forms = await _formService.GetAllEmployerFormsAsync();
        return Ok(forms);
    }

    /// <summary>
    /// Update employer form status (Admin only)
    /// </summary>
    [HttpPut("employer/{id}/status")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<IActionResult> UpdateEmployerFormStatus(
        int id, 
        [FromBody] UpdateStatusDto dto)
    {
        var result = await _formService.UpdateEmployerFormStatusAsync(id, dto.Status, dto.AdminNotes);
        if (!result)
            return NotFound();
        
        return Ok(new { message = "Status updated successfully" });
    }

    #endregion

    #region Employee Forms

    /// <summary>
    /// Submit employee form (job application)
    /// Public endpoint - no authentication required
    /// Supports multipart/form-data for file upload
    /// </summary>
    [HttpPost("employee")]
    [AllowAnonymous]
    public async Task<ActionResult<EmployeeFormDto>> SubmitEmployeeForm(
        [FromForm] string? salutation,
        [FromForm] string fullName,
        [FromForm] string email,
        [FromForm] string phone,
        [FromForm] string? profession,
        [FromForm] int? experience,
        [FromForm] string? education,
        [FromForm] string? germanLevel,
        [FromForm] string? additionalInfo,
        [FromForm] string? specialRequests,
        [FromForm] string? language,
        IFormFile? cvFile)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var result = await _formService.SubmitEmployeeFormAsync(
            salutation, fullName, email, phone, profession, experience, education, 
            germanLevel, additionalInfo, specialRequests, language, cvFile, 
            ipAddress, userAgent);
        
        _logger.LogInformation("Employee form submitted: {FullName}, Email: {Email}", 
            fullName, email);
        
        return Ok(result);
    }

    /// <summary>
    /// Get employee form by ID (Admin only)
    /// </summary>
    [HttpGet("employee/{id}")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<ActionResult<EmployeeFormDto>> GetEmployeeForm(int id)
    {
        var form = await _formService.GetEmployeeFormByIdAsync(id);
        if (form == null)
            return NotFound();
        
        return Ok(form);
    }

    /// <summary>
    /// Get all employee forms (Admin only)
    /// </summary>
    [HttpGet("employee")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<ActionResult<List<EmployeeFormDto>>> GetAllEmployeeForms()
    {
        var forms = await _formService.GetAllEmployeeFormsAsync();
        return Ok(forms);
    }

    /// <summary>
    /// Update employee form status (Admin only)
    /// </summary>
    [HttpPut("employee/{id}/status")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<IActionResult> UpdateEmployeeFormStatus(
        int id, 
        [FromBody] UpdateStatusDto dto)
    {
        var result = await _formService.UpdateEmployeeFormStatusAsync(id, dto.Status, dto.AdminNotes);
        if (!result)
            return NotFound();
        
        return Ok(new { message = "Status updated successfully" });
    }

    #endregion

    #region Contact Forms

    /// <summary>
    /// Submit contact form (general inquiry)
    /// Public endpoint - no authentication required
    /// </summary>
    [HttpPost("contact")]
    [AllowAnonymous]
    public async Task<ActionResult<ContactFormDto>> SubmitContactForm([FromBody] SubmitContactFormDto dto)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var result = await _formService.SubmitContactFormAsync(dto, ipAddress, userAgent);
        
        _logger.LogInformation("Contact form submitted: {FirstName} {LastName}, Email: {Email}", 
            dto.FirstName, dto.LastName, dto.Email);
        
        return Ok(result);
    }

    /// <summary>
    /// Get contact form by ID (Admin only)
    /// </summary>
    [HttpGet("contact/{id}")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<ActionResult<ContactFormDto>> GetContactForm(int id)
    {
        var form = await _formService.GetContactFormByIdAsync(id);
        if (form == null)
            return NotFound();
        
        return Ok(form);
    }

    /// <summary>
    /// Get all contact forms (Admin only)
    /// </summary>
    [HttpGet("contact")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<ActionResult<List<ContactFormDto>>> GetAllContactForms()
    {
        var forms = await _formService.GetAllContactFormsAsync();
        return Ok(forms);
    }

    /// <summary>
    /// Update contact form status (Admin only)
    /// </summary>
    [HttpPut("contact/{id}/status")]
    [Authorize(Policy = wixi.WebAPI.Authorization.Policies.AdminOrEmployee)]
    public async Task<IActionResult> UpdateContactFormStatus(
        int id, 
        [FromBody] UpdateStatusDto dto)
    {
        var result = await _formService.UpdateContactFormStatusAsync(id, dto.Status, dto.AdminNotes);
        if (!result)
            return NotFound();
        
        return Ok(new { message = "Status updated successfully" });
    }

    #endregion
}

/// <summary>
/// DTO for updating form status
/// </summary>
public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? AdminNotes { get; set; }
}

