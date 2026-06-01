using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Commands;
using Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class ServiceCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;
    public ServiceCategoriesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("service-categories")]
    public async Task<IActionResult> GetServiceCategories()
    {
        var result = await _mediator.Send(new GetServiceCategoriesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("service-categories")]
    public async Task<IActionResult> CreateServiceCategory([FromBody] CreateServiceCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("service-categories")]
    public async Task<IActionResult> UpdateServiceCategory([FromBody] UpdateServiceCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("service-categories/{id}")]
    public async Task<IActionResult> DeleteServiceCategory(Guid id)
    {
        var result = await _mediator.Send(new DeleteServiceCategoryCommand(id));
        return result ? Ok() : BadRequest();
    }
}
