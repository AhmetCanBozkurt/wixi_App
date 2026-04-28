using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ECommerce.Infrastructure.Tenant;

/// <summary>
/// Request scope'unda aktif tenant bilgisini tutar.
/// TenantMiddleware tarafından doldurulur, ECommerceDbContext tarafından tüketilir.
/// </summary>
public class TenantContext : ITenantContext
{
    private Guid _tenantId;
    private string _connectionString = string.Empty;
    private string _slug = string.Empty;
    private bool _isSet = false;

    public Guid TenantId => _tenantId;
    public string ConnectionString => _connectionString;
    public string Slug => _slug;

    public void Set(Guid tenantId, string connectionString, string slug)
    {
        _tenantId = tenantId;
        _connectionString = connectionString;
        _slug = slug;
        _isSet = true;
    }

    public bool IsResolved => _isSet;
}
