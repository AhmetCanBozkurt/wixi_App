using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Analytics;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/analytics")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminAnalyticsController : ControllerBase
{
    private readonly IMediator _mediator;
    public StoreAdminAnalyticsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("overview")]
    public async Task<IActionResult> Overview([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _mediator.Send(new GetAnalyticsOverviewQuery(from, to));
        return Ok(result);
    }

    [HttpGet("orders-by-day")]
    public async Task<IActionResult> OrdersByDay(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var f = from ?? DateTime.UtcNow.AddDays(-30);
        var t = to ?? DateTime.UtcNow;
        var result = await _mediator.Send(new GetOrdersByDayQuery(f, t));
        return Ok(result);
    }
}
