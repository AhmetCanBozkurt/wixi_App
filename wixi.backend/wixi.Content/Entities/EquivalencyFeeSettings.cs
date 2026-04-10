namespace wixi.Content.Entities;

/// <summary>
/// Equivalency Fee Settings - Denklik ücreti ve açıklamaları yönetimi
/// Multi-language support for equivalency fee information
/// </summary>
public class EquivalencyFeeSettings
{
    public int Id { get; set; }
    
    // Fee Amount
    public decimal Amount { get; set; } = 200.00m;
    public string Currency { get; set; } = "EUR";
    
    // Why Pay Fee Title (4 languages)
    public string WhyPayTitleTr { get; set; } = "Denklik Ücreti Neden Ödenir?";
    public string? WhyPayTitleDe { get; set; }
    public string? WhyPayTitleEn { get; set; }
    public string? WhyPayTitleAr { get; set; }
    
    // Why Pay Fee Description (4 languages)
    public string WhyPayDescriptionTr { get; set; } = string.Empty;
    public string? WhyPayDescriptionDe { get; set; }
    public string? WhyPayDescriptionEn { get; set; }
    public string? WhyPayDescriptionAr { get; set; }
    
    // Why Process Necessary Title (4 languages)
    public string WhyProcessTitleTr { get; set; } = "Denklik İşlemi Neden Gereklidir?";
    public string? WhyProcessTitleDe { get; set; }
    public string? WhyProcessTitleEn { get; set; }
    public string? WhyProcessTitleAr { get; set; }
    
    // Why Process Necessary Items (JSON array for each language)
    public string WhyProcessItemsTr { get; set; } = "[]"; // JSON array
    public string? WhyProcessItemsDe { get; set; }
    public string? WhyProcessItemsEn { get; set; }
    public string? WhyProcessItemsAr { get; set; }
    
    // Fee Scope Title (4 languages)
    public string FeeScopeTitleTr { get; set; } = "Denklik Ücreti Kapsamı";
    public string? FeeScopeTitleDe { get; set; }
    public string? FeeScopeTitleEn { get; set; }
    public string? FeeScopeTitleAr { get; set; }
    
    // Fee Scope Items (JSON array for each language)
    public string FeeScopeItemsTr { get; set; } = "[]"; // JSON array
    public string? FeeScopeItemsDe { get; set; }
    public string? FeeScopeItemsEn { get; set; }
    public string? FeeScopeItemsAr { get; set; }
    
    // Note/Additional Info (4 languages)
    public string? NoteTr { get; set; }
    public string? NoteDe { get; set; }
    public string? NoteEn { get; set; }
    public string? NoteAr { get; set; }
    
    // Payment Summary Title (4 languages)
    public string PaymentSummaryTitleTr { get; set; } = "Denklik Ücreti Ödemesi";
    public string? PaymentSummaryTitleDe { get; set; }
    public string? PaymentSummaryTitleEn { get; set; }
    public string? PaymentSummaryTitleAr { get; set; }
    
    // Payment Summary Description (4 languages)
    public string PaymentSummaryDescriptionTr { get; set; } = "Eğitim Denkliği İşlem Ücreti";
    public string? PaymentSummaryDescriptionDe { get; set; }
    public string? PaymentSummaryDescriptionEn { get; set; }
    public string? PaymentSummaryDescriptionAr { get; set; }
    
    // Fee Item Description (4 languages)
    public string FeeItemDescriptionTr { get; set; } = "Yurtdışı eğitim belgelerinizin denklik işlemi için ücret";
    public string? FeeItemDescriptionDe { get; set; }
    public string? FeeItemDescriptionEn { get; set; }
    public string? FeeItemDescriptionAr { get; set; }
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    
    /// <summary>
    /// Row version for concurrency control
    /// </summary>
    public byte[]? RowVersion { get; set; }
}

