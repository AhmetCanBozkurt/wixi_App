using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Products.Queries.GetProducts;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/public/storefront/products")]
public class StorefrontProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetProductsQuery query)
    {
        // For public storefront, always force IsActive = true so unpublished products are hidden
        var safeQuery = query with { IsActive = true };
        
        var result = await _mediator.Send(safeQuery);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new Wixi.Modules.ECommerce.Application.Products.Queries.GetProductBySlug.GetProductBySlugQuery(slug));
        if (result == null)
            return NotFound(new { error = "Ürün bulunamadı." });
            
        return Ok(result);
    }
}
