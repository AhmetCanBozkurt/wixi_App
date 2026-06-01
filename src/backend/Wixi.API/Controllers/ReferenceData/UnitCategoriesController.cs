using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Commands;
using Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class UnitCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;
    public UnitCategoriesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("unit-categories")]
    public async Task<IActionResult> GetUnitCategories()
    {
        var result = await _mediator.Send(new GetUnitCategoriesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("unit-categories")]
    public async Task<IActionResult> CreateUnitCategory([FromBody] CreateUnitCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("unit-categories")]
    public async Task<IActionResult> UpdateUnitCategory([FromBody] UpdateUnitCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("unit-categories/{id}")]
    public async Task<IActionResult> DeleteUnitCategory(Guid id)
    {
        var result = await _mediator.Send(new DeleteUnitCategoryCommand(id));
        return result ? Ok() : BadRequest();
    }
}
