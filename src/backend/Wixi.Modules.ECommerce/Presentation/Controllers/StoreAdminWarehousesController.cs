using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Warehouses.Commands.CreateWarehouse;
using Wixi.Modules.ECommerce.Application.Warehouses.Commands.UpdateWarehouse;
using Wixi.Modules.ECommerce.Application.Warehouses.Queries.GetWarehouses;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/warehouses")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminWarehousesController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminWarehousesController(IMediator mediator) => _mediator = mediator;

    /// <summary>Returns all active warehouses ordered by default status then name.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetWarehousesQuery());
        return Ok(result);
    }

    /// <summary>Creates a new warehouse. If IsDefault is true, clears all other defaults first.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWarehouseCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>Updates an existing warehouse. Route ID must match command ID.</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWarehouseCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Depo bulunamadi." });

        return NoContent();
    }
}
