using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Categories;

namespace Wixi.API.Controllers.Storefront;

[ApiController]
[Route("api/v1/public/storefront/categories")]
public class StorefrontCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontCategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetCategoriesQuery(IncludeInactive: false));
        return Ok(result);
    }
}
