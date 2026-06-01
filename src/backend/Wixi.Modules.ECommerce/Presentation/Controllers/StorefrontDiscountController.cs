using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Discounts;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/public/storefront/coupons")]
public class StorefrontDiscountController : ControllerBase
{
    private readonly IMediator _mediator;
    public StorefrontDiscountController(IMediator mediator) => _mediator = mediator;

    [HttpPost("apply")]
    public async Task<IActionResult> Apply([FromBody] ApplyCouponCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsValid)
            return BadRequest(new { error = result.Error });
        return Ok(result);
    }
}
