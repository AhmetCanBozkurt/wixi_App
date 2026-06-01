using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Orders.Queries.GetPaymentLogs;

namespace Wixi.API.Controllers.StoreAdmin;

[ApiController]
[Route("api/v1/store-admin/payments")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminPaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<StoreAdminPaymentsController> _logger;

    public StoreAdminPaymentsController(
        IMediator mediator,
        ILogger<StoreAdminPaymentsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaymentLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? statusFilter = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetPaymentLogsQuery(page, pageSize, statusFilter), ct);

        _logger.LogInformation(
            "Store admin payment logs fetched: page={Page}, statusFilter={StatusFilter}",
            page, statusFilter);

        return Ok(result);
    }
}
