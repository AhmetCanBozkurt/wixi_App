using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Content.DTOs;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/license")]
[Asp.Versioning.ApiVersion("1.0")]
public class AdminLicenseController : ControllerBase
{
    private readonly ILicenseService _licenseService;
    private readonly ILogger<AdminLicenseController> _logger;

    public AdminLicenseController(
        ILicenseService licenseService,
        ILogger<AdminLicenseController> logger)
    {
        _licenseService = licenseService;
        _logger = logger;
    }

    /// <summary>
    /// Validate and save license key
    /// AllowAnonymous because we need to validate license even when license is invalid
    /// </summary>
    [HttpPost("validate")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateLicense([FromBody] LicenseValidationRequestDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.LicenseKey))
            {
                return BadRequest(new { success = false, message = "License key is required" });
            }

            _logger.LogInformation("License validation requested by admin: {UserId}", 
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

            var validationResult = await _licenseService.ValidateLicenseAsync(
                dto.LicenseKey, 
                dto.MachineCode, 
                dto.ClientVersion);

            if (validationResult == null)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Failed to validate license. Please check your connection and try again." 
                });
            }

            if (!validationResult.Success || validationResult.Data == null)
            {
                return BadRequest(new { 
                    success = false, 
                    message = validationResult.Data?.Reason ?? "License validation failed" 
                });
            }

            // Save license to database
            var saved = await _licenseService.SaveLicenseAsync(
                validationResult, 
                dto.LicenseKey, 
                dto.MachineCode, 
                dto.ClientVersion);

            if (!saved)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to save license information" 
                });
            }

            var status = await _licenseService.GetLicenseStatusAsync();

            return Ok(new { 
                success = true, 
                message = "License validated and saved successfully",
                data = new {
                    isValid = status.IsValid,
                    expireDate = status.ExpireDate,
                    daysRemaining = status.DaysRemaining,
                    tenantCompanyName = status.TenantCompanyName
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating license");
            return StatusCode(500, new { 
                success = false, 
                message = "An error occurred while validating the license" 
            });
        }
    }

    /// <summary>
    /// Get current license status
    /// AllowAnonymous because we need to check license status even when license is invalid
    /// </summary>
    [HttpGet("status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLicenseStatus()
    {
        try
        {
            var status = await _licenseService.GetLicenseStatusAsync();
            var license = await _licenseService.GetCurrentLicenseAsync();

            return Ok(new { 
                success = true, 
                data = new {
                    isValid = status.IsValid,
                    isExpired = status.IsExpired,
                    expireDate = status.ExpireDate,
                    daysRemaining = status.DaysRemaining,
                    tenantCompanyName = status.TenantCompanyName,
                    lastValidatedAt = status.LastValidatedAt,
                    licenseKey = license?.LicenseKey != null 
                        ? $"{license.LicenseKey.Substring(0, 4)}-****-****-{license.LicenseKey.Substring(license.LicenseKey.Length - 4)}" 
                        : null
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting license status");
            return StatusCode(500, new { 
                success = false, 
                message = "An error occurred while getting license status" 
            });
        }
    }

    /// <summary>
    /// Get current license details (for admin panel)
    /// </summary>
    [HttpGet("current")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCurrentLicense()
    {
        try
        {
            var license = await _licenseService.GetCurrentLicenseAsync();
            
            if (license == null)
            {
                return Ok(new { 
                    success = true, 
                    data = (object?)null 
                });
            }

            return Ok(new { 
                success = true, 
                data = license
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current license");
            return StatusCode(500, new { 
                success = false, 
                message = "An error occurred while getting license information" 
            });
        }
    }

    /// <summary>
    /// Update license settings (for admin panel)
    /// </summary>
    [HttpPut("{id}")]
    [AllowAnonymous] // Allow anonymous so admin can update license even when invalid
    public async Task<IActionResult> UpdateLicense(int id, [FromBody] UpdateLicenseDto dto)
    {
        try
        {
            var updated = await _licenseService.UpdateLicenseAsync(
                id, 
                dto.IsValid, 
                dto.ExpireDate, 
                dto.TenantCompanyName, 
                dto.IsActive);

            if (!updated)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Failed to update license. License not found." 
                });
            }

            var status = await _licenseService.GetLicenseStatusAsync();

            return Ok(new { 
                success = true, 
                message = "License updated successfully",
                data = new {
                    isValid = status.IsValid,
                    isExpired = status.IsExpired,
                    expireDate = status.ExpireDate,
                    daysRemaining = status.DaysRemaining
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating license");
            return StatusCode(500, new { 
                success = false, 
                message = "An error occurred while updating the license" 
            });
        }
    }

    /// <summary>
    /// Clear license status cache (force refresh from API)
    /// </summary>
    [HttpPost("cache/clear")]
    [AllowAnonymous]
    public IActionResult ClearLicenseCache()
    {
        try
        {
            _licenseService.ClearLicenseStatusCache();
            return Ok(new { success = true, message = "License status cache cleared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing license cache");
            return StatusCode(500, new { success = false, message = "An error occurred while clearing license cache" });
        }
    }
}

/// <summary>
/// DTO for updating license
/// </summary>
public class UpdateLicenseDto
{
    public bool? IsValid { get; set; }
    public DateTime? ExpireDate { get; set; }
    public string? TenantCompanyName { get; set; }
    public bool? IsActive { get; set; }
}

