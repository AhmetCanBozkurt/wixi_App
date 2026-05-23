using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Finance.Application.Categories.Commands.CreateFinanceCategory;
using Wixi.Modules.Finance.Application.Categories.Commands.UpdateFinanceCategory;
using Wixi.Modules.Finance.Application.Categories.Commands.DeleteFinanceCategory;
using Wixi.Modules.Finance.Application.Categories.Queries.GetFinanceCategories;
using Wixi.Modules.Finance.Application.Categories.Queries.GetFinanceCategoryById;
using Wixi.Modules.Finance.Application.Categories.Dto;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.API.Controllers.Finance;

[ApiController]
[Route("api/v1/finance/categories")]
[Authorize]
public class FinanceCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public FinanceCategoriesController(IMediator mediator) => _mediator = mediator;

    private string GetTenantSlug() => Request.Headers["X-Tenant-Slug"].ToString();

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] FinanceCategoryType? type = null)
    {
        var result = await _mediator.Send(new GetFinanceCategoriesQuery
        {
            TenantId = GetTenantSlug(),
            Type = type,
        });
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new GetFinanceCategoryByIdQuery
            {
                CategoryId = id,
                TenantId = GetTenantSlug(),
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFinanceCategoryDto dto)
    {
        try
        {
            var result = await _mediator.Send(new CreateFinanceCategoryCommand
            {
                TenantId = GetTenantSlug(),
                Dto = dto,
            });
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFinanceCategoryDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdateFinanceCategoryCommand
            {
                CategoryId = id,
                TenantId = GetTenantSlug(),
                Dto = dto,
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _mediator.Send(new DeleteFinanceCategoryCommand
        {
            CategoryId = id,
            TenantId = GetTenantSlug(),
        });

        if (!deleted) return NotFound(new { success = false, message = "Kategori bulunamadı." });
        return Ok(new { success = true, message = "Kategori silindi." });
    }
}
