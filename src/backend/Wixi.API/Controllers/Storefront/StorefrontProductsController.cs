using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Products.Queries.GetProducts;
using Wixi.Modules.ECommerce.Application.Products.Queries.GetProductBySlug;

namespace Wixi.API.Controllers.Storefront;

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
    public async Task<IActionResult> GetAll([FromQuery] StorefrontProductsQuery query)
    {
        var safeQuery = new GetProductsQuery(
            Page: query.Page,
            PageSize: query.Limit ?? query.PageSize,
            Search: query.Search,
            CategoryId: query.CategoryId,
            BrandId: query.BrandId,
            IsActive: true,
            IsFeatured: query.Featured,
            SortBy: query.SortBy,
            MinPrice: query.MinPrice,
            MaxPrice: query.MaxPrice
        );

        var result = await _mediator.Send(safeQuery);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new GetProductBySlugQuery(slug));
        if (result == null)
            return NotFound(new { error = "Ürün bulunamadı." });

        return Ok(result);
    }
}

public record StorefrontProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? CategoryId = null,
    Guid? BrandId = null,
    bool? Featured = null,
    string? SortBy = null,
    int? Limit = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null
);
