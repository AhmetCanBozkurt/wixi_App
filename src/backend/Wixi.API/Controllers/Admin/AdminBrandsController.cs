using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Brands;

namespace Wixi.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/ecommerce/brands")]
[Authorize]
public class AdminBrandsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminBrandsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetBrandsQuery(search, includeInactive));
        return Ok(new { items = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBrandCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBrandCommand command)
    {
        if (id != command.Id) return BadRequest(new { error = "ID mismatch" });
        var success = await _mediator.Send(command);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteBrandCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }
}
