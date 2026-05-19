using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/dashboard")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminDashboardController : ControllerBase
{
    private readonly ECommerceDbContext _db;

    public StoreAdminDashboardController(ECommerceDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Returns aggregate statistics for the tenant's store dashboard.
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var productCount = await _db.Products
            .CountAsync(p => !p.IsDeleted, ct);

        var activeProductCount = await _db.Products
            .CountAsync(p => !p.IsDeleted && p.IsActive, ct);

        var customerCount = await _db.Customers
            .CountAsync(c => !c.IsDeleted, ct);

        var categoryCount = await _db.Categories
            .CountAsync(c => !c.IsDeleted, ct);

        var brandCount = await _db.Brands
            .CountAsync(b => !b.IsDeleted, ct);

        // Low-stock: any variant where StockQuantity <= LowStockThreshold and TrackInventory is on
        var lowStockCount = await _db.ProductVariants
            .CountAsync(
                v => !v.IsDeleted
                     && v.Product != null
                     && v.Product.TrackInventory
                     && v.StockQuantity <= v.LowStockThreshold,
                ct);

        return Ok(new
        {
            productCount,
            activeProductCount,
            customerCount,
            categoryCount,
            brandCount,
            lowStockCount
        });
    }
}
