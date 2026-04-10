namespace wixi.Content.DTOs;

/// <summary>
/// DTO for Equivalency Fee Settings
/// </summary>
public class EquivalencyFeeSettingsDto
{
    public int Id { get; set; }
    
    // Fee Amount
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    
    // Why Pay Fee
    public string WhyPayTitleTr { get; set; } = string.Empty;
    public string? WhyPayTitleDe { get; set; }
    public string? WhyPayTitleEn { get; set; }
    public string? WhyPayTitleAr { get; set; }
    public string WhyPayDescriptionTr { get; set; } = string.Empty;
    public string? WhyPayDescriptionDe { get; set; }
    public string? WhyPayDescriptionEn { get; set; }
    public string? WhyPayDescriptionAr { get; set; }
    
    // Why Process Necessary
    public string WhyProcessTitleTr { get; set; } = string.Empty;
    public string? WhyProcessTitleDe { get; set; }
    public string? WhyProcessTitleEn { get; set; }
    public string? WhyProcessTitleAr { get; set; }
    public List<string> WhyProcessItemsTr { get; set; } = new();
    public List<string>? WhyProcessItemsDe { get; set; }
    public List<string>? WhyProcessItemsEn { get; set; }
    public List<string>? WhyProcessItemsAr { get; set; }
    
    // Fee Scope
    public string FeeScopeTitleTr { get; set; } = string.Empty;
    public string? FeeScopeTitleDe { get; set; }
    public string? FeeScopeTitleEn { get; set; }
    public string? FeeScopeTitleAr { get; set; }
    public List<string> FeeScopeItemsTr { get; set; } = new();
    public List<string>? FeeScopeItemsDe { get; set; }
    public List<string>? FeeScopeItemsEn { get; set; }
    public List<string>? FeeScopeItemsAr { get; set; }
    
    // Note
    public string? NoteTr { get; set; }
    public string? NoteDe { get; set; }
    public string? NoteEn { get; set; }
    public string? NoteAr { get; set; }
    
    // Payment Summary
    public string PaymentSummaryTitleTr { get; set; } = string.Empty;
    public string? PaymentSummaryTitleDe { get; set; }
    public string? PaymentSummaryTitleEn { get; set; }
    public string? PaymentSummaryTitleAr { get; set; }
    public string PaymentSummaryDescriptionTr { get; set; } = string.Empty;
    public string? PaymentSummaryDescriptionDe { get; set; }
    public string? PaymentSummaryDescriptionEn { get; set; }
    public string? PaymentSummaryDescriptionAr { get; set; }
    
    // Fee Item Description
    public string FeeItemDescriptionTr { get; set; } = string.Empty;
    public string? FeeItemDescriptionDe { get; set; }
    public string? FeeItemDescriptionEn { get; set; }
    public string? FeeItemDescriptionAr { get; set; }
    
    public bool IsActive { get; set; }
}

