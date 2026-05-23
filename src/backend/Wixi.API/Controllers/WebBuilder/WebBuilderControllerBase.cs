using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers.WebBuilder;

public abstract class WebBuilderControllerBase : ControllerBase
{
    protected readonly WixiCoreDbContext Db;

    protected WebBuilderControllerBase(WixiCoreDbContext db)
    {
        Db = db;
    }

    protected async Task<Guid> ResolveTenantIdAsync(CancellationToken ct = default)
    {
        var claim = User.FindFirstValue("tenant_id");
        if (!string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out var tenantId))
            return tenantId;

        var slug = Request.Headers["X-Tenant-Slug"].FirstOrDefault();
        if (!string.IsNullOrEmpty(slug))
        {
            var id = await Db.Tenants
                .Where(t => t.Slug == slug && !t.IsDeleted)
                .Select(t => (Guid?)t.Id)
                .FirstOrDefaultAsync(ct);
            if (id.HasValue) return id.Value;
        }

        return Guid.Empty;
    }
}
