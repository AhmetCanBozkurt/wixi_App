using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Orders.Commands.CreateOrder;
using Wixi.Modules.ECommerce.Application.Orders.Queries.GetMyOrders;
using Wixi.Modules.ECommerce.Application.Orders.Queries.GetOrderByNumber;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/public/storefront/orders")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class StorefrontOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontOrdersController(IMediator mediator) => _mediator = mediator;

    private Guid GetCustomerId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(value!);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        try
        {
            var result = await _mediator.Send(new CreateOrderCommand(
                customerId,
                req.Items.Select(i => new OrderItemInput(i.ProductId, i.VariantId, i.Quantity)).ToList(),
                req.ShippingAddress,
                req.BillingAddress,
                req.Currency ?? "TRY"), ct);

            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders(CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var orders = await _mediator.Send(new GetMyOrdersQuery(customerId), ct);
        return Ok(orders);
    }

    [HttpGet("{orderNumber}")]
    public async Task<IActionResult> GetOrder(string orderNumber, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var order = await _mediator.Send(new GetOrderByNumberQuery(orderNumber, customerId), ct);
        if (order == null)
            return NotFound(new { error = "Sipariş bulunamadı." });
        return Ok(order);
    }
}

public record CreateOrderItemRequest(Guid ProductId, Guid? VariantId, int Quantity);

public record CreateOrderRequest(
    List<CreateOrderItemRequest> Items,
    string ShippingAddress,
    string BillingAddress,
    string? Currency = "TRY"
);
