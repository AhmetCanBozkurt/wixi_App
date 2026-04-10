namespace wixi.Content.Entities;

/// <summary>
/// Team Member - Ekip üyeleri ("About Us" / "Team" page)
/// Multi-language support for DE, TR, EN
/// </summary>
public class TeamMember
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Basic Information
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Experience { get; set; } = string.Empty; // e.g., "15+"
    
    // Position (Multi-language)
    public string PositionDe { get; set; } = string.Empty;
    public string PositionTr { get; set; } = string.Empty;
    public string? PositionEn { get; set; }
    
    // Location (Multi-language)
    public string LocationDe { get; set; } = string.Empty;
    public string LocationTr { get; set; } = string.Empty;
    public string? LocationEn { get; set; }
    
    // Education (Multi-language)
    public string EducationDe { get; set; } = string.Empty;
    public string EducationTr { get; set; } = string.Empty;
    public string? EducationEn { get; set; }
    
    // Bio (Multi-language)
    public string BioDe { get; set; } = string.Empty;
    public string BioTr { get; set; } = string.Empty;
    public string? BioEn { get; set; }
    
    // Philosophy (Multi-language, optional)
    public string? PhilosophyDe { get; set; }
    public string? PhilosophyTr { get; set; }
    public string? PhilosophyEn { get; set; }
    
    // Specializations (JSON array stored as string)
    public string? SpecializationsDe { get; set; }
    public string? SpecializationsTr { get; set; }
    public string? SpecializationsEn { get; set; }
    
    // Languages (JSON array stored as string)
    public string? LanguagesDe { get; set; }
    public string? LanguagesTr { get; set; }
    public string? LanguagesEn { get; set; }
    
    // Achievements (JSON array stored as string)
    public string? AchievementsDe { get; set; }
    public string? AchievementsTr { get; set; }
    public string? AchievementsEn { get; set; }
    
    // Ordering
    public int DisplayOrder { get; set; } = 0;
    
    // Status
    public bool IsActive { get; set; } = true;
    
    // Consultation/Appointment Settings
    public bool CanProvideConsultation { get; set; } = false;  // Danışmanlık verebilir mi?
    public decimal? ConsultationPrice { get; set; }  // Randevu ücreti
    public string? ConsultationCurrency { get; set; }  // Döviz cinsi (EUR, USD, TRY, GBP, etc.)
}

