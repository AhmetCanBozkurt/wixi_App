using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Wixi.Modules.ECommerce.Application.Loyalty;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/public/storefront/loyalty")]
[Authorize(Roles = "StoreCustomer")]
public class StorefrontLoyaltyController : ControllerBase
{
    private readonly IMediator _mediator;
    public StorefrontLoyaltyController(IMediator mediator) => _mediator = mediator;

    private Guid CustomerId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        var result = await _mediator.Send(new GetLoyaltyBalanceQuery(CustomerId));
        return Ok(result);
    }
}
