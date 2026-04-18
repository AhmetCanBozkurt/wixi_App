using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

/// <summary>
/// Dinamik Mail Şablonlarını tutan tablo.
/// </summary>
public class WixiMailTemplate : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Şablonun benzersiz kodu (örn: "WELCOME_EMAIL", "PASSWORD_RESET").
    /// </summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>
    /// Mailin konusu. Scriban yer tutucuları içerebilir.
    /// </summary>
    public string Subject { get; set; } = string.Empty;
    
    /// <summary>
    /// Mailin HTML içeriği. Scriban yer tutucuları içerebilir.
    /// </summary>
    public string Body { get; set; } = string.Empty;
    
    /// <summary>
    /// Şablon kategorisi (örn: "Auth", "System", "Client").
    /// </summary>
    public string? Category { get; set; }

    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
