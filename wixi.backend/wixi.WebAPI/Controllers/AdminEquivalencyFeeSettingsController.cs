using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.Content.DTOs;
using wixi.Content.Entities;
using wixi.DataAccess;
using wixi.WebAPI.Authorization;
using System.Text.Json;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/equivalency-fee-settings")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminEquivalencyFeeSettingsController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminEquivalencyFeeSettingsController> _logger;

    public AdminEquivalencyFeeSettingsController(
        WixiDbContext context,
        ILogger<AdminEquivalencyFeeSettingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get equivalency fee settings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<EquivalencyFeeSettingsDto>> GetSettings()
    {
        try
        {
            var settings = await _context.EquivalencyFeeSettings
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                return Ok(new EquivalencyFeeSettingsDto());
            }

            return Ok(MapToDto(settings));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting equivalency fee settings");
            return StatusCode(500, new { message = "Error getting equivalency fee settings" });
        }
    }

    /// <summary>
    /// Create or update equivalency fee settings
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> UpsertSettings([FromBody] EquivalencyFeeSettingsDto dto)
    {
        try
        {
            var existing = await _context.EquivalencyFeeSettings
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            EquivalencyFeeSettings settings;

            if (existing == null)
            {
                settings = MapFromDto(dto);
                settings.CreatedBy = User?.Identity?.Name ?? "System";
                settings.CreatedAt = DateTime.UtcNow;
                _context.EquivalencyFeeSettings.Add(settings);
            }
            else
            {
                settings = existing;
                UpdateFromDto(settings, dto);
                settings.UpdatedBy = User?.Identity?.Name ?? "System";
                settings.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(MapToDto(settings));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting equivalency fee settings");
            return StatusCode(500, new { message = "Error upserting equivalency fee settings" });
        }
    }

    /// <summary>
    /// Update equivalency fee settings
    /// </summary>
    [HttpPut]
    public async Task<ActionResult> UpdateSettings([FromBody] EquivalencyFeeSettingsDto dto)
    {
        try
        {
            var settings = await _context.EquivalencyFeeSettings
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                settings = MapFromDto(dto);
                settings.CreatedBy = User?.Identity?.Name ?? "System";
                settings.CreatedAt = DateTime.UtcNow;
                _context.EquivalencyFeeSettings.Add(settings);
            }
            else
            {
                UpdateFromDto(settings, dto);
                settings.UpdatedBy = User?.Identity?.Name ?? "System";
                settings.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(MapToDto(settings));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating equivalency fee settings");
            return StatusCode(500, new { message = "Error updating equivalency fee settings" });
        }
    }

    private EquivalencyFeeSettingsDto MapToDto(EquivalencyFeeSettings entity)
    {
        return new EquivalencyFeeSettingsDto
        {
            Id = entity.Id,
            Amount = entity.Amount,
            Currency = entity.Currency,
            WhyPayTitleTr = entity.WhyPayTitleTr,
            WhyPayTitleDe = entity.WhyPayTitleDe,
            WhyPayTitleEn = entity.WhyPayTitleEn,
            WhyPayTitleAr = entity.WhyPayTitleAr,
            WhyPayDescriptionTr = entity.WhyPayDescriptionTr,
            WhyPayDescriptionDe = entity.WhyPayDescriptionDe,
            WhyPayDescriptionEn = entity.WhyPayDescriptionEn,
            WhyPayDescriptionAr = entity.WhyPayDescriptionAr,
            WhyProcessTitleTr = entity.WhyProcessTitleTr,
            WhyProcessTitleDe = entity.WhyProcessTitleDe,
            WhyProcessTitleEn = entity.WhyProcessTitleEn,
            WhyProcessTitleAr = entity.WhyProcessTitleAr,
            WhyProcessItemsTr = DeserializeList(entity.WhyProcessItemsTr),
            WhyProcessItemsDe = entity.WhyProcessItemsDe != null ? DeserializeList(entity.WhyProcessItemsDe) : null,
            WhyProcessItemsEn = entity.WhyProcessItemsEn != null ? DeserializeList(entity.WhyProcessItemsEn) : null,
            WhyProcessItemsAr = entity.WhyProcessItemsAr != null ? DeserializeList(entity.WhyProcessItemsAr) : null,
            FeeScopeTitleTr = entity.FeeScopeTitleTr,
            FeeScopeTitleDe = entity.FeeScopeTitleDe,
            FeeScopeTitleEn = entity.FeeScopeTitleEn,
            FeeScopeTitleAr = entity.FeeScopeTitleAr,
            FeeScopeItemsTr = DeserializeList(entity.FeeScopeItemsTr),
            FeeScopeItemsDe = entity.FeeScopeItemsDe != null ? DeserializeList(entity.FeeScopeItemsDe) : null,
            FeeScopeItemsEn = entity.FeeScopeItemsEn != null ? DeserializeList(entity.FeeScopeItemsEn) : null,
            FeeScopeItemsAr = entity.FeeScopeItemsAr != null ? DeserializeList(entity.FeeScopeItemsAr) : null,
            NoteTr = entity.NoteTr,
            NoteDe = entity.NoteDe,
            NoteEn = entity.NoteEn,
            NoteAr = entity.NoteAr,
            PaymentSummaryTitleTr = entity.PaymentSummaryTitleTr,
            PaymentSummaryTitleDe = entity.PaymentSummaryTitleDe,
            PaymentSummaryTitleEn = entity.PaymentSummaryTitleEn,
            PaymentSummaryTitleAr = entity.PaymentSummaryTitleAr,
            PaymentSummaryDescriptionTr = entity.PaymentSummaryDescriptionTr,
            PaymentSummaryDescriptionDe = entity.PaymentSummaryDescriptionDe,
            PaymentSummaryDescriptionEn = entity.PaymentSummaryDescriptionEn,
            PaymentSummaryDescriptionAr = entity.PaymentSummaryDescriptionAr,
            FeeItemDescriptionTr = entity.FeeItemDescriptionTr,
            FeeItemDescriptionDe = entity.FeeItemDescriptionDe,
            FeeItemDescriptionEn = entity.FeeItemDescriptionEn,
            FeeItemDescriptionAr = entity.FeeItemDescriptionAr,
            IsActive = entity.IsActive
        };
    }

    private EquivalencyFeeSettings MapFromDto(EquivalencyFeeSettingsDto dto)
    {
        return new EquivalencyFeeSettings
        {
            Amount = dto.Amount,
            Currency = dto.Currency,
            WhyPayTitleTr = dto.WhyPayTitleTr,
            WhyPayTitleDe = dto.WhyPayTitleDe,
            WhyPayTitleEn = dto.WhyPayTitleEn,
            WhyPayTitleAr = dto.WhyPayTitleAr,
            WhyPayDescriptionTr = dto.WhyPayDescriptionTr,
            WhyPayDescriptionDe = dto.WhyPayDescriptionDe,
            WhyPayDescriptionEn = dto.WhyPayDescriptionEn,
            WhyPayDescriptionAr = dto.WhyPayDescriptionAr,
            WhyProcessTitleTr = dto.WhyProcessTitleTr,
            WhyProcessTitleDe = dto.WhyProcessTitleDe,
            WhyProcessTitleEn = dto.WhyProcessTitleEn,
            WhyProcessTitleAr = dto.WhyProcessTitleAr,
            WhyProcessItemsTr = SerializeList(dto.WhyProcessItemsTr),
            WhyProcessItemsDe = dto.WhyProcessItemsDe != null ? SerializeList(dto.WhyProcessItemsDe) : null,
            WhyProcessItemsEn = dto.WhyProcessItemsEn != null ? SerializeList(dto.WhyProcessItemsEn) : null,
            WhyProcessItemsAr = dto.WhyProcessItemsAr != null ? SerializeList(dto.WhyProcessItemsAr) : null,
            FeeScopeTitleTr = dto.FeeScopeTitleTr,
            FeeScopeTitleDe = dto.FeeScopeTitleDe,
            FeeScopeTitleEn = dto.FeeScopeTitleEn,
            FeeScopeTitleAr = dto.FeeScopeTitleAr,
            FeeScopeItemsTr = SerializeList(dto.FeeScopeItemsTr),
            FeeScopeItemsDe = dto.FeeScopeItemsDe != null ? SerializeList(dto.FeeScopeItemsDe) : null,
            FeeScopeItemsEn = dto.FeeScopeItemsEn != null ? SerializeList(dto.FeeScopeItemsEn) : null,
            FeeScopeItemsAr = dto.FeeScopeItemsAr != null ? SerializeList(dto.FeeScopeItemsAr) : null,
            NoteTr = dto.NoteTr,
            NoteDe = dto.NoteDe,
            NoteEn = dto.NoteEn,
            NoteAr = dto.NoteAr,
            PaymentSummaryTitleTr = dto.PaymentSummaryTitleTr,
            PaymentSummaryTitleDe = dto.PaymentSummaryTitleDe,
            PaymentSummaryTitleEn = dto.PaymentSummaryTitleEn,
            PaymentSummaryTitleAr = dto.PaymentSummaryTitleAr,
            PaymentSummaryDescriptionTr = dto.PaymentSummaryDescriptionTr,
            PaymentSummaryDescriptionDe = dto.PaymentSummaryDescriptionDe,
            PaymentSummaryDescriptionEn = dto.PaymentSummaryDescriptionEn,
            PaymentSummaryDescriptionAr = dto.PaymentSummaryDescriptionAr,
            FeeItemDescriptionTr = dto.FeeItemDescriptionTr,
            FeeItemDescriptionDe = dto.FeeItemDescriptionDe,
            FeeItemDescriptionEn = dto.FeeItemDescriptionEn,
            FeeItemDescriptionAr = dto.FeeItemDescriptionAr,
            IsActive = dto.IsActive
        };
    }

    private void UpdateFromDto(EquivalencyFeeSettings entity, EquivalencyFeeSettingsDto dto)
    {
        entity.Amount = dto.Amount;
        entity.Currency = dto.Currency;
        entity.WhyPayTitleTr = dto.WhyPayTitleTr;
        entity.WhyPayTitleDe = dto.WhyPayTitleDe;
        entity.WhyPayTitleEn = dto.WhyPayTitleEn;
        entity.WhyPayTitleAr = dto.WhyPayTitleAr;
        entity.WhyPayDescriptionTr = dto.WhyPayDescriptionTr;
        entity.WhyPayDescriptionDe = dto.WhyPayDescriptionDe;
        entity.WhyPayDescriptionEn = dto.WhyPayDescriptionEn;
        entity.WhyPayDescriptionAr = dto.WhyPayDescriptionAr;
        entity.WhyProcessTitleTr = dto.WhyProcessTitleTr;
        entity.WhyProcessTitleDe = dto.WhyProcessTitleDe;
        entity.WhyProcessTitleEn = dto.WhyProcessTitleEn;
        entity.WhyProcessTitleAr = dto.WhyProcessTitleAr;
        entity.WhyProcessItemsTr = SerializeList(dto.WhyProcessItemsTr);
        entity.WhyProcessItemsDe = dto.WhyProcessItemsDe != null ? SerializeList(dto.WhyProcessItemsDe) : null;
        entity.WhyProcessItemsEn = dto.WhyProcessItemsEn != null ? SerializeList(dto.WhyProcessItemsEn) : null;
        entity.WhyProcessItemsAr = dto.WhyProcessItemsAr != null ? SerializeList(dto.WhyProcessItemsAr) : null;
        entity.FeeScopeTitleTr = dto.FeeScopeTitleTr;
        entity.FeeScopeTitleDe = dto.FeeScopeTitleDe;
        entity.FeeScopeTitleEn = dto.FeeScopeTitleEn;
        entity.FeeScopeTitleAr = dto.FeeScopeTitleAr;
        entity.FeeScopeItemsTr = SerializeList(dto.FeeScopeItemsTr);
        entity.FeeScopeItemsDe = dto.FeeScopeItemsDe != null ? SerializeList(dto.FeeScopeItemsDe) : null;
        entity.FeeScopeItemsEn = dto.FeeScopeItemsEn != null ? SerializeList(dto.FeeScopeItemsEn) : null;
        entity.FeeScopeItemsAr = dto.FeeScopeItemsAr != null ? SerializeList(dto.FeeScopeItemsAr) : null;
        entity.NoteTr = dto.NoteTr;
        entity.NoteDe = dto.NoteDe;
        entity.NoteEn = dto.NoteEn;
        entity.NoteAr = dto.NoteAr;
        entity.PaymentSummaryTitleTr = dto.PaymentSummaryTitleTr;
        entity.PaymentSummaryTitleDe = dto.PaymentSummaryTitleDe;
        entity.PaymentSummaryTitleEn = dto.PaymentSummaryTitleEn;
        entity.PaymentSummaryTitleAr = dto.PaymentSummaryTitleAr;
        entity.PaymentSummaryDescriptionTr = dto.PaymentSummaryDescriptionTr;
        entity.PaymentSummaryDescriptionDe = dto.PaymentSummaryDescriptionDe;
        entity.PaymentSummaryDescriptionEn = dto.PaymentSummaryDescriptionEn;
        entity.PaymentSummaryDescriptionAr = dto.PaymentSummaryDescriptionAr;
        entity.FeeItemDescriptionTr = dto.FeeItemDescriptionTr;
        entity.FeeItemDescriptionDe = dto.FeeItemDescriptionDe;
        entity.FeeItemDescriptionEn = dto.FeeItemDescriptionEn;
        entity.FeeItemDescriptionAr = dto.FeeItemDescriptionAr;
        entity.IsActive = dto.IsActive;
    }

    private string SerializeList(List<string> list)
    {
        return JsonSerializer.Serialize(list);
    }

    private List<string> DeserializeList(string json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "[]")
            return new List<string>();

        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}

