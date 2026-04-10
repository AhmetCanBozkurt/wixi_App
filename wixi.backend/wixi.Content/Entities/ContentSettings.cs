namespace wixi.Content.Entities;

/// <summary>
/// Content Settings - Homepage and general content management
/// Multi-language support for homepage sections
/// </summary>
public class ContentSettings
{
    public int Id { get; set; }
    
    // Footer Company Description (4 languages)
    public string FooterCompanyDescDe { get; set; } = string.Empty;
    public string FooterCompanyDescTr { get; set; } = string.Empty;
    public string? FooterCompanyDescEn { get; set; }
    public string? FooterCompanyDescAr { get; set; }
    
    // Social Media Links
    public string? FacebookUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    
    // About Mission Text 1 (4 languages)
    public string AboutMissionText1De { get; set; } = string.Empty;
    public string AboutMissionText1Tr { get; set; } = string.Empty;
    public string? AboutMissionText1En { get; set; }
    public string? AboutMissionText1Ar { get; set; }
    
    // About Mission Text 2 (4 languages)
    public string AboutMissionText2De { get; set; } = string.Empty;
    public string AboutMissionText2Tr { get; set; } = string.Empty;
    public string? AboutMissionText2En { get; set; }
    public string? AboutMissionText2Ar { get; set; }
    
    // Contact Information
    public string ContactPhone { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string AddressGermany { get; set; } = string.Empty;
    public string AddressTurkeyMersin { get; set; } = string.Empty;
    public string AddressTurkeyIstanbul { get; set; } = string.Empty;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
    
    /// <summary>
    /// Row version for concurrency control
    /// </summary>
    public byte[]? RowVersion { get; set; }
}

