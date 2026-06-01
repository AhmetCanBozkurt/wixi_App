using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Cart;

namespace Wixi.API.Controllers.Storefront;

[ApiController]
[Route("api/v1/public/storefront/cart")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class StorefrontCartController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontCartController(IMediator mediator) => _mediator = mediator;

    private Guid GetCustomerId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(value!);
    }

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var items = await _mediator.Send(new GetCartQuery(customerId), ct);
        return Ok(items);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest req, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        try
        {
            var item = await _mediator.Send(
                new AddToCartCommand(customerId, req.ProductId, req.VariantId, req.Quantity), ct);
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateCartItem(Guid id, [FromBody] UpdateCartItemRequest req, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        try
        {
            await _mediator.Send(new UpdateCartItemCommand(id, customerId, req.Quantity), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Sepet öğesi bulunamadı." });
        }
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveFromCart(Guid id, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        try
        {
            await _mediator.Send(new RemoveFromCartCommand(id, customerId), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Sepet öğesi bulunamadı." });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken ct)
    {
        var customerId = GetCustomerId();
        await _mediator.Send(new ClearCartCommand(customerId), ct);
        return NoContent();
    }
}

public record AddToCartRequest(Guid ProductId, Guid? VariantId, int Quantity = 1);
public record UpdateCartItemRequest(int Quantity);
