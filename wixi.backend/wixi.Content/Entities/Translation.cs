namespace wixi.Content.Entities;

/// <summary>
/// Translation - Dynamic translation system
/// Used for frontend text translations in multiple languages
/// </summary>
public class Translation
{
    public int Id { get; set; }
    
    /// <summary>
    /// Translation key (e.g., "contact.title", "hero.subtitle")
    /// </summary>
    public string Key { get; set; } = string.Empty;
    
    /// <summary>
    /// German translation
    /// </summary>
    public string? De { get; set; }
    
    /// <summary>
    /// Turkish translation
    /// </summary>
    public string? Tr { get; set; }
    
    /// <summary>
    /// English translation
    /// </summary>
    public string? En { get; set; }
    
    /// <summary>
    /// Arabic translation
    /// </summary>
    public string? Ar { get; set; }
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
    
    /// <summary>
    /// Row version for concurrency control
    /// </summary>
    public byte[]? RowVersion { get; set; }
}

