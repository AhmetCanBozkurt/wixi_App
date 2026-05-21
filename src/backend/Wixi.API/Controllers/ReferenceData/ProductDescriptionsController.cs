using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Commands;
using Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class ProductDescriptionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProductDescriptionsController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("product-descriptions")]
    public async Task<IActionResult> GetProductDescriptions()
    {
        var result = await _mediator.Send(new GetProductDescriptionsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("product-descriptions")]
    public async Task<IActionResult> CreateProductDescription([FromBody] CreateProductDescriptionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("product-descriptions")]
    public async Task<IActionResult> UpdateProductDescription([FromBody] UpdateProductDescriptionCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("product-descriptions/{id}")]
    public async Task<IActionResult> DeleteProductDescription(Guid id)
    {
        var result = await _mediator.Send(new DeleteProductDescriptionCommand(id));
        return result ? Ok() : BadRequest();
    }
}
