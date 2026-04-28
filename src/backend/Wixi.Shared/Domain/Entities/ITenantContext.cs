namespace Wixi.Shared.Domain.Entities;

/// <summary>
/// Aktif tenant (mağaza) bağlam bilgisini sağlar.
/// Middleware tarafından request başında doldurulur, DI ile enjekte edilir.
/// </summary>
public interface ITenantContext
{
    /// <summary>Aktif tenant'ın benzersiz kimliği.</summary>
    Guid TenantId { get; }

    /// <summary>Aktif tenant'ın veritabanı bağlantı dizisi.</summary>
    string ConnectionString { get; }

    /// <summary>Aktif tenant'ın alt alan adı (subdomain). Örn: "abc-store"</summary>
    string Slug { get; }

    /// <summary>Tenant context'i set et (yalnızca middleware kullanır).</summary>
    void Set(Guid tenantId, string connectionString, string slug);
}
