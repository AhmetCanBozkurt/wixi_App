namespace Wixi.Modules.ECommerce.Domain.Entities;

/// <summary>
/// Ziyaretçi iletişim formu gönderimi.
/// IAuditable uygulamaz — ziyaretçi verisidir, admin tarafından oluşturulmaz/düzenlenmez.
/// </summary>
public class WixiContactFormSubmission
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Gönderenin tam adı.</summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>Gönderenin e-posta adresi.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Telefon numarası.</summary>
    public string? Phone { get; set; }

    /// <summary>Mesaj konusu.</summary>
    public string? Subject { get; set; }

    /// <summary>Mesaj içeriği.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Admin tarafından okundu mu?</summary>
    public bool IsRead { get; set; } = false;

    /// <summary>Okunma tarihi.</summary>
    public DateTime? ReadAt { get; set; }

    /// <summary>Gönderenin IP adresi.</summary>
    public string? IpAddress { get; set; }

    /// <summary>Gönderim tarihi.</summary>
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
