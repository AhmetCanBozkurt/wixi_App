using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.Content.DTOs;
using wixi.DataAccess;
using System.Text.Json;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/equivalency-fee-settings")]
[Asp.Versioning.ApiVersion("1.0")]
public class PublicEquivalencyFeeSettingsController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<PublicEquivalencyFeeSettingsController> _logger;

    public PublicEquivalencyFeeSettingsController(
        WixiDbContext context,
        ILogger<PublicEquivalencyFeeSettingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get active equivalency fee settings (Public)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<EquivalencyFeeSettingsDto>> GetSettings()
    {
        try
        {
            var settings = await _context.EquivalencyFeeSettings
                .Where(s => s.IsActive)
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

    private EquivalencyFeeSettingsDto MapToDto(wixi.Content.Entities.EquivalencyFeeSettings entity)
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

