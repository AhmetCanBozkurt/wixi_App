using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

/// <summary>
/// Gönderilen maillerin kaydını tutan tablo.
/// </summary>
public class WixiMailLog : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Şablon kodu (Eğer bir şablon ile gönderildiyse).
    /// </summary>
    public string? TemplateCode { get; set; }
    
    /// <summary>
    /// Alıcı e-posta adresi.
    /// </summary>
    public string Recipient { get; set; } = string.Empty;
    
    /// <summary>
    /// Mail konusu.
    /// </summary>
    public string Subject { get; set; } = string.Empty;
    
    /// <summary>
    /// Gönderilen mailin nihai içeriği.
    /// </summary>
    public string Body { get; set; } = string.Empty;
    
    /// <summary>
    /// Gönderim durumu (Success, Failed).
    /// </summary>
    public bool IsSuccess { get; set; }
    
    /// <summary>
    /// Hata oluştuysa hata mesajı.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gönderilme zamanı.
    /// </summary>
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
