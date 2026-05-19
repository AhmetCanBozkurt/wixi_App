using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Orders.Commands.UpdateOrderStatus;
using Wixi.Modules.ECommerce.Application.Orders.Queries.GetOrderById;
using Wixi.Modules.ECommerce.Application.Orders.Queries.GetOrders;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/store-admin/orders")]
public class StoreAdminOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var result = await _mediator.Send(new GetOrdersQuery(search));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
    {
        if (id != command.Id) return BadRequest();
        var result = await _mediator.Send(command);
        if (!result) return NotFound();
        return Ok();
    }
}
