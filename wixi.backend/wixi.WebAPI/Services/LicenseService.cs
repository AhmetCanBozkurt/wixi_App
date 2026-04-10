using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using wixi.DataAccess;
using wixi.Content.Entities;
using wixi.Content.DTOs;

namespace wixi.WebAPI.Services;

public interface ILicenseService
{
    Task<LicenseValidationResponseDto?> ValidateLicenseAsync(string licenseKey, string? machineCode = null, string? clientVersion = null);
    Task<LicenseSettingsDto?> GetCurrentLicenseAsync();
    Task<LicenseStatusDto> GetLicenseStatusAsync();
    Task<bool> IsLicenseValidAsync();
    Task<bool> SaveLicenseAsync(LicenseValidationResponseDto validationResult, string licenseKey, string? machineCode = null, string? clientVersion = null);
    Task<bool> UpdateLicenseAsync(int id, bool? isValid, DateTime? expireDate, string? tenantCompanyName, bool? isActive);
    void ClearLicenseStatusCache();
}

public class LicenseService : ILicenseService
{
    private readonly WixiDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;
    private readonly ILogger<LicenseService> _logger;

    public LicenseService(
        WixiDbContext context,
        HttpClient httpClient,
        IConfiguration configuration,
        IMemoryCache cache,
        ILogger<LicenseService> logger)
    {
        _context = context;
        _httpClient = httpClient;
        _configuration = configuration;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Validate license key via external API
    /// </summary>
    public async Task<LicenseValidationResponseDto?> ValidateLicenseAsync(string licenseKey, string? machineCode = null, string? clientVersion = null)
    {
        try
        {
            var apiUrl = _configuration["License:ApiUrl"] ?? "https://api.wixisoftware.com/api/v1/licenses/validate";
            var defaultMachineCode = _configuration["License:MachineCode"] ?? Environment.MachineName;
            var defaultClientVersion = _configuration["License:ClientVersion"] ?? "2.0.0";

            var request = new LicenseValidationRequestDto
            {
                LicenseKey = licenseKey,
                MachineCode = machineCode ?? defaultMachineCode,
                ClientVersion = clientVersion ?? defaultClientVersion
            };

            _logger.LogInformation("Validating license key: {LicenseKey} with machine code: {MachineCode}", 
                licenseKey, request.MachineCode);

            var response = await _httpClient.PostAsJsonAsync(apiUrl, request);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("License validation API returned error: {StatusCode}, {Error}", 
                    response.StatusCode, errorContent);
                return null;
            }

            // Use JsonSerializerOptions to handle DateTime parsing correctly
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            
            var result = await response.Content.ReadFromJsonAsync<LicenseValidationResponseDto>(jsonOptions);
            
            // Ensure ExpireDate is treated as UTC if it doesn't have timezone info
            if (result?.Data?.ExpireDate != null && result.Data.ExpireDate.Value.Kind == DateTimeKind.Unspecified)
            {
                result.Data.ExpireDate = DateTime.SpecifyKind(result.Data.ExpireDate.Value, DateTimeKind.Utc);
            }
            
            if (result != null)
            {
                _logger.LogInformation("License validation result: Success={Success}, IsValid={IsValid}, ExpireDate={ExpireDate} (Kind={Kind})",
                    result.Success, result.Data?.IsValid, result.Data?.ExpireDate, result.Data?.ExpireDate?.Kind);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating license key: {LicenseKey}", licenseKey);
            return null;
        }
    }

    /// <summary>
    /// Get current license from database
    /// </summary>
    public async Task<LicenseSettingsDto?> GetCurrentLicenseAsync()
    {
        var license = await _context.LicenseSettings
            .Where(l => l.IsActive)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync();

        if (license == null) return null;

        return new LicenseSettingsDto
        {
            Id = license.Id,
            LicenseKey = license.LicenseKey,
            IsValid = license.IsValid,
            ExpireDate = license.ExpireDate,
            TenantId = license.TenantId,
            TenantCompanyName = license.TenantCompanyName,
            MachineCode = license.MachineCode,
            ClientVersion = license.ClientVersion,
            LastValidatedAt = license.LastValidatedAt,
            IsActive = license.IsActive,
            CreatedAt = license.CreatedAt,
            UpdatedAt = license.UpdatedAt
        };
    }

    /// <summary>
    /// Get license status directly from API (with cache)
    /// </summary>
    public async Task<LicenseStatusDto> GetLicenseStatusAsync()
    {
        const string cacheKey = "license_status";
        
        if (_cache.TryGetValue(cacheKey, out LicenseStatusDto? cachedStatus) && cachedStatus != null)
        {
            _logger.LogInformation("License status retrieved from cache: IsValid={IsValid}, IsExpired={IsExpired}", 
                cachedStatus.IsValid, cachedStatus.IsExpired);
            return cachedStatus;
        }

        _logger.LogInformation("Cache miss - fetching license status from API");

        // Get license key from database (only the key, not the status)
        var license = await _context.LicenseSettings
            .Where(l => l.IsActive)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync();
        
        if (license == null || string.IsNullOrEmpty(license.LicenseKey))
        {
            _logger.LogWarning("No active license found in database for status check");
            var noLicenseStatus = new LicenseStatusDto
            {
                IsValid = false,
                IsExpired = true,
                DaysRemaining = 0
            };
            
            // Cache for 30 seconds if no license (check frequently for new license)
            _cache.Set(cacheKey, noLicenseStatus, TimeSpan.FromSeconds(30));
            return noLicenseStatus;
        }

        _logger.LogInformation("Fetching license status from API for LicenseKey: {LicenseKey} (masked: {MaskedKey})", 
            license.LicenseKey, 
            license.LicenseKey.Length > 8 
                ? $"{license.LicenseKey.Substring(0, 4)}...{license.LicenseKey.Substring(license.LicenseKey.Length - 4)}" 
                : "****");

        // Validate license directly from API
        var validationResult = await ValidateLicenseAsync(
            license.LicenseKey, 
            license.MachineCode, 
            license.ClientVersion);

        if (validationResult == null)
        {
            _logger.LogWarning("License validation API returned null response");
            var invalidStatus = new LicenseStatusDto
            {
                IsValid = false,
                IsExpired = true,
                DaysRemaining = 0
            };
            
            // Cache for 30 seconds if validation fails (retry sooner)
            _cache.Set(cacheKey, invalidStatus, TimeSpan.FromSeconds(30));
            return invalidStatus;
        }

        if (!validationResult.Success || validationResult.Data == null)
        {
            _logger.LogWarning("License validation API returned unsuccessful result. Success: {Success}, Data: {Data}", 
                validationResult.Success, 
                validationResult.Data == null ? "null" : $"IsValid={validationResult.Data.IsValid}, ExpireDate={validationResult.Data.ExpireDate}");
            var invalidStatus = new LicenseStatusDto
            {
                IsValid = false,
                IsExpired = true,
                DaysRemaining = 0
            };
            
            // Cache for 30 seconds if validation fails (retry sooner)
            _cache.Set(cacheKey, invalidStatus, TimeSpan.FromSeconds(30));
            return invalidStatus;
        }

        _logger.LogInformation("License validation API response: Success={Success}, IsValid={IsValid}, ExpireDate={ExpireDate}, TenantCompanyName={TenantCompanyName}",
            validationResult.Success,
            validationResult.Data.IsValid,
            validationResult.Data.ExpireDate,
            validationResult.Data.TenantCompanyName);

        // Ensure ExpireDate is in UTC
        DateTime? expireDateUtc = null;
        if (validationResult.Data.ExpireDate.HasValue)
        {
            var expireDate = validationResult.Data.ExpireDate.Value;
            if (expireDate.Kind == DateTimeKind.Unspecified || expireDate.Kind == DateTimeKind.Local)
            {
                expireDateUtc = expireDate.Kind == DateTimeKind.Local 
                    ? expireDate.ToUniversalTime() 
                    : DateTime.SpecifyKind(expireDate, DateTimeKind.Utc);
            }
            else
            {
                expireDateUtc = expireDate;
            }
        }

        var isExpired = expireDateUtc.HasValue && expireDateUtc.Value < DateTime.UtcNow;
        var daysRemaining = expireDateUtc.HasValue 
            ? Math.Max(0, (int)(expireDateUtc.Value - DateTime.UtcNow).TotalDays)
            : 0;

        var status = new LicenseStatusDto
        {
            IsValid = validationResult.Data.IsValid && !isExpired,
            ExpireDate = expireDateUtc,
            IsExpired = isExpired,
            DaysRemaining = daysRemaining,
            TenantCompanyName = validationResult.Data.TenantCompanyName,
            LastValidatedAt = DateTime.UtcNow
        };

        // Cache duration based on expiry - shorter durations for real-time validation
        var cacheDuration = daysRemaining <= 7 
            ? TimeSpan.FromSeconds(30)  // If expiring soon, cache for 30 seconds
            : TimeSpan.FromMinutes(2);  // Otherwise cache for 2 minutes (reduced from 5)

        _cache.Set(cacheKey, status, cacheDuration);
        
        _logger.LogInformation("License status retrieved from API: IsValid={IsValid}, IsExpired={IsExpired}, DaysRemaining={DaysRemaining}",
            status.IsValid, status.IsExpired, status.DaysRemaining);
        
        return status;
    }

    /// <summary>
    /// Check if license is valid (quick check with cache)
    /// </summary>
    public async Task<bool> IsLicenseValidAsync()
    {
        var status = await GetLicenseStatusAsync();
        return status.IsValid;
    }

    /// <summary>
    /// Save license validation result to database
    /// </summary>
    public async Task<bool> SaveLicenseAsync(LicenseValidationResponseDto validationResult, string licenseKey, string? machineCode = null, string? clientVersion = null)
    {
        try
        {
            if (validationResult?.Data == null)
            {
                _logger.LogWarning("Cannot save license: validation result data is null");
                return false;
            }

            var existingLicense = await _context.LicenseSettings
                .FirstOrDefaultAsync(l => l.LicenseKey == licenseKey);

            var defaultMachineCode = _configuration["License:MachineCode"] ?? Environment.MachineName;
            var defaultClientVersion = _configuration["License:ClientVersion"] ?? "2.0.0";

            // Ensure ExpireDate is in UTC (API may return without timezone info)
            DateTime? expireDateUtc = null;
            if (validationResult.Data.ExpireDate.HasValue)
            {
                var expireDate = validationResult.Data.ExpireDate.Value;
                // If DateTime is Unspecified or Local, convert to UTC
                if (expireDate.Kind == DateTimeKind.Unspecified || expireDate.Kind == DateTimeKind.Local)
                {
                    expireDateUtc = expireDate.Kind == DateTimeKind.Local 
                        ? expireDate.ToUniversalTime() 
                        : DateTime.SpecifyKind(expireDate, DateTimeKind.Utc);
                }
                else
                {
                    expireDateUtc = expireDate;
                }
            }

            if (existingLicense != null)
            {
                // Update existing license
                existingLicense.IsValid = validationResult.Data.IsValid;
                existingLicense.ExpireDate = expireDateUtc;
                existingLicense.TenantId = validationResult.Data.TenantId;
                existingLicense.TenantCompanyName = validationResult.Data.TenantCompanyName;
                existingLicense.MachineCode = machineCode ?? defaultMachineCode;
                existingLicense.ClientVersion = clientVersion ?? defaultClientVersion;
                existingLicense.LastValidatedAt = DateTime.UtcNow;
                existingLicense.ValidationResult = JsonSerializer.Serialize(validationResult);
                existingLicense.IsActive = true; // Ensure license is active after validation
                existingLicense.UpdatedAt = DateTime.UtcNow;
                existingLicense.UpdatedBy = "System";
            }
            else
            {
                // Create new license
                var newLicense = new LicenseSettings
                {
                    LicenseKey = licenseKey,
                    IsValid = validationResult.Data.IsValid,
                    ExpireDate = expireDateUtc,
                    TenantId = validationResult.Data.TenantId,
                    TenantCompanyName = validationResult.Data.TenantCompanyName,
                    MachineCode = machineCode ?? defaultMachineCode,
                    ClientVersion = clientVersion ?? defaultClientVersion,
                    LastValidatedAt = DateTime.UtcNow,
                    ValidationResult = JsonSerializer.Serialize(validationResult),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                };

                _context.LicenseSettings.Add(newLicense);
            }

            await _context.SaveChangesAsync();

            // Clear cache
            _cache.Remove("license_status");

            _logger.LogInformation("License saved successfully: {LicenseKey}, IsValid: {IsValid}, ExpireDate: {ExpireDate} (UTC)", 
                licenseKey, validationResult.Data.IsValid, expireDateUtc);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving license: {LicenseKey}", licenseKey);
            return false;
        }
    }

    /// <summary>
    /// Update license settings (for admin panel)
    /// </summary>
    public async Task<bool> UpdateLicenseAsync(int id, bool? isValid, DateTime? expireDate, string? tenantCompanyName, bool? isActive)
    {
        try
        {
            var license = await _context.LicenseSettings.FindAsync(id);
            if (license == null)
            {
                _logger.LogWarning("License not found for update: {LicenseId}", id);
                return false;
            }

            // Update only provided fields
            if (isValid.HasValue)
            {
                license.IsValid = isValid.Value;
            }
            if (expireDate.HasValue)
            {
                license.ExpireDate = expireDate.Value;
            }
            if (tenantCompanyName != null)
            {
                license.TenantCompanyName = tenantCompanyName;
            }
            if (isActive.HasValue)
            {
                license.IsActive = isActive.Value;
            }

            license.UpdatedAt = DateTime.UtcNow;
            license.UpdatedBy = "Admin";

            await _context.SaveChangesAsync();

            // Clear cache
            _cache.Remove("license_status");

            _logger.LogInformation("License updated successfully: {LicenseId}, IsValid: {IsValid}, ExpireDate: {ExpireDate}", 
                id, license.IsValid, license.ExpireDate);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating license: {LicenseId}", id);
            return false;
        }
    }

    /// <summary>
    /// Clear license status cache
    /// </summary>
    public void ClearLicenseStatusCache()
    {
        _cache.Remove("license_status");
        _logger.LogInformation("License status cache cleared");
    }
}

