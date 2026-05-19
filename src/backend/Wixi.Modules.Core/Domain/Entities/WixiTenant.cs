using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

/// <summary>
/// WIXI platformunda her bir müşteriyi (tenant) temsil eder.
/// Master DB'de saklanır. Her tenant'ın kendi izole veritabanı olabilir.
/// </summary>
public class WixiTenant : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Format: YYYYXXX (Örn: 2026001)</summary>
    public string TenantCode { get; set; } = string.Empty;

    /// <summary>Müşteri/Firma adı.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>URL dostu benzersiz tanımlayıcı. Örn: "abc-holding"</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Tenant'ın veritabanı adı.</summary>
    public string DatabaseName { get; set; } = string.Empty;

    /// <summary>Tenant veritabanı bağlantı dizisi.</summary>
    public string ConnectionString { get; set; } = string.Empty;

    /// <summary>Aktif olan modüller (virgülle ayrılmış: "ecommerce,notes,crm").</summary>
    public string EnabledModules { get; set; } = "ecommerce";

    /// <summary>Plan: Free, Starter, Pro, Enterprise</summary>
    public string Plan { get; set; } = "Free";

    /// <summary>Abonelik bitiş tarihi.</summary>
    public DateTime? SubscriptionExpiresAt { get; set; }

    /// <summary>Yönetici e-posta adresi.</summary>
    public string OwnerEmail { get; set; } = string.Empty;

    /// <summary>Logo URL.</summary>
    public string? LogoUrl { get; set; }

    /// <summary>Bu tenant'ı oluşturan WixiUser'ın ID'si.</summary>
    public Guid? OwnerUserId { get; set; }

    // Özelleştirme alanları
    public string? ThemeColorPrimary { get; set; }
    public string? CustomDomain { get; set; }
    public string? BannerImageUrl { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }

    /// <summary>Veritabanı en son ne zaman migrate edildi?</summary>
    public bool IsMigrated { get; set; } = false;

    /// <summary>Provisioning sırasında oluşan son hata mesajı.</summary>
    public string? LastMigrationError { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
