using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.Service.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Service.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class ServicesController : ControllerBase
{
    private readonly IMediator _mediator;
    public ServicesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var result = await _mediator.Send(new GetServicesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("services")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("services")]
    public async Task<IActionResult> UpdateService([FromBody] UpdateServiceCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(Guid id)
    {
        var result = await _mediator.Send(new DeleteServiceCommand(id));
        return result ? Ok() : BadRequest();
    }
}
