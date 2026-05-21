using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.PackageType.Commands;
using Wixi.Modules.Core.Application.ReferenceData.PackageType.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class PackageTypesController : ControllerBase
{
    private readonly IMediator _mediator;
    public PackageTypesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("package-types")]
    public async Task<IActionResult> GetPackageTypes()
    {
        var result = await _mediator.Send(new GetPackageTypesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("package-types")]
    public async Task<IActionResult> CreatePackageType([FromBody] CreatePackageTypeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("package-types")]
    public async Task<IActionResult> UpdatePackageType([FromBody] UpdatePackageTypeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("package-types/{id}")]
    public async Task<IActionResult> DeletePackageType(Guid id)
    {
        var result = await _mediator.Send(new DeletePackageTypeCommand(id));
        return result ? Ok() : BadRequest();
    }
}
