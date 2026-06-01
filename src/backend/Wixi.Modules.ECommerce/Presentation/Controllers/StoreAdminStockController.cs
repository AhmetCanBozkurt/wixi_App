using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Stock.Commands.CreateStockMovement;
using Wixi.Modules.ECommerce.Application.Stock.Queries.GetStockByWarehouse;
using Wixi.Modules.ECommerce.Application.Stock.Queries.GetStockMovements;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminStockController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminStockController(IMediator mediator) => _mediator = mediator;

    /// <summary>Returns current stock levels. Optionally filtered by warehouseId.</summary>
    [HttpGet("api/v1/store-admin/stock")]
    public async Task<IActionResult> GetStock([FromQuery] Guid? warehouseId)
    {
        var result = await _mediator.Send(new GetStockByWarehouseQuery(warehouseId));
        return Ok(result);
    }

    /// <summary>Returns a paged list of stock movements. Filterable by variantId and warehouseId.</summary>
    [HttpGet("api/v1/store-admin/stock/movements")]
    public async Task<IActionResult> GetMovements(
        [FromQuery] Guid? variantId,
        [FromQuery] Guid? warehouseId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetStockMovementsQuery(variantId, warehouseId, page, pageSize));
        return Ok(result);
    }

    /// <summary>Records a new stock movement (GRN, SALE, RTN, TRF, ADJ) and updates WixiStock accordingly.</summary>
    [HttpPost("api/v1/store-admin/stock/movements")]
    public async Task<IActionResult> CreateMovement([FromBody] CreateStockMovementCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetMovements), new { id }, new { id });
    }
}
