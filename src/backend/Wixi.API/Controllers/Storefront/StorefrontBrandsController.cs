using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Brands;

namespace Wixi.API.Controllers.Storefront;

[ApiController]
[Route("api/v1/public/storefront/brands")]
public class StorefrontBrandsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontBrandsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetBrandsQuery(IncludeInactive: false), ct);
        return Ok(result);
    }
}
