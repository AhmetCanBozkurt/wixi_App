using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/license")]
[Asp.Versioning.ApiVersion("1.0")]
[AllowAnonymous]
public class PublicLicenseController : ControllerBase
{
    private readonly ILicenseService _licenseService;
    private readonly ILogger<PublicLicenseController> _logger;

    public PublicLicenseController(
        ILicenseService licenseService,
        ILogger<PublicLicenseController> logger)
    {
        _licenseService = licenseService;
        _logger = logger;
    }

    /// <summary>
    /// Get public license status (only valid/invalid, no sensitive info)
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetLicenseStatus()
    {
        try
        {
            var status = await _licenseService.GetLicenseStatusAsync();

            return Ok(new { 
                success = true, 
                data = new {
                    isValid = status.IsValid,
                    isExpired = status.IsExpired
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting public license status");
            // Return invalid on error to be safe
            return Ok(new { 
                success = true, 
                data = new {
                    isValid = false,
                    isExpired = true
                }
            });
        }
    }
}

