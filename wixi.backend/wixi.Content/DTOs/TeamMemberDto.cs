namespace wixi.Content.DTOs
{
    public class TeamMemberDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Experience { get; set; } = string.Empty;
        
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
        
        // Specializations, Languages, Achievements (JSON strings)
        public string? SpecializationsDe { get; set; }
        public string? SpecializationsTr { get; set; }
        public string? SpecializationsEn { get; set; }
        public string? LanguagesDe { get; set; }
        public string? LanguagesTr { get; set; }
        public string? LanguagesEn { get; set; }
        public string? AchievementsDe { get; set; }
        public string? AchievementsTr { get; set; }
        public string? AchievementsEn { get; set; }
        
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        
        // Consultation/Appointment Settings
        public bool CanProvideConsultation { get; set; }
        public decimal? ConsultationPrice { get; set; }
        public string? ConsultationCurrency { get; set; }
    }
}
