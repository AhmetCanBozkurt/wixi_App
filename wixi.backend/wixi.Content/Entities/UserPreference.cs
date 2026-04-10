namespace wixi.Content.Entities;

/// <summary>
/// User Preference - User-specific settings
/// Stores language and theme preferences for each user
/// </summary>
public class UserPreference
{
    public int Id { get; set; }
    
    /// <summary>
    /// User ID (from JWT NameIdentifier claim)
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Preferred language (de, tr, en, ar)
    /// </summary>
    public string Language { get; set; } = "de";
    
    /// <summary>
    /// Preferred theme (light, dark)
    /// </summary>
    public string Theme { get; set; } = "light";
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

