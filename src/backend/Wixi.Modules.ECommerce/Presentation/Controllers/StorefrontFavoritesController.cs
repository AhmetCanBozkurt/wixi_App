using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Wixi.Modules.ECommerce.Application.Favorites;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/public/storefront/favorites")]
[Authorize(Roles = "StoreCustomer")]
public class StorefrontFavoritesController : ControllerBase
{
    private readonly IMediator _mediator;
    public StorefrontFavoritesController(IMediator mediator) => _mediator = mediator;

    private Guid CustomerId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetFavoritesQuery(CustomerId));
        return Ok(result);
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> Toggle(Guid productId)
    {
        var added = await _mediator.Send(new ToggleFavoriteCommand(CustomerId, productId));
        return Ok(new { added });
    }
}
