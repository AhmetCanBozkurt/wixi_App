using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Finance.Application.Budgets.Commands.CreateFinanceBudget;
using Wixi.Modules.Finance.Application.Budgets.Commands.UpdateFinanceBudget;
using Wixi.Modules.Finance.Application.Budgets.Commands.DeleteFinanceBudget;
using Wixi.Modules.Finance.Application.Budgets.Commands.SetFinanceBudgetCategoryAllocations;
using Wixi.Modules.Finance.Application.Budgets.Commands.RecalculateFinanceBudgetSpent;
using Wixi.Modules.Finance.Application.Budgets.Queries.GetFinanceBudgets;
using Wixi.Modules.Finance.Application.Budgets.Queries.GetFinanceBudgetById;
using Wixi.Modules.Finance.Application.Budgets.Dto;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.API.Controllers.Finance;

[ApiController]
[Route("api/v1/finance/budgets")]
[Authorize]
public class FinanceBudgetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FinanceBudgetsController(IMediator mediator) => _mediator = mediator;

    private string GetTenantSlug() => Request.Headers["X-Tenant-Slug"].ToString();

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] FinanceBudgetStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetFinanceBudgetsQuery
        {
            TenantId = GetTenantSlug(),
            Status = status,
            Page = page,
            PageSize = pageSize,
        });
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new GetFinanceBudgetByIdQuery
            {
                BudgetId = id,
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
    public async Task<IActionResult> Create([FromBody] CreateFinanceBudgetDto dto)
    {
        try
        {
            var result = await _mediator.Send(new CreateFinanceBudgetCommand
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFinanceBudgetDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdateFinanceBudgetCommand
            {
                BudgetId = id,
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
        var deleted = await _mediator.Send(new DeleteFinanceBudgetCommand
        {
            BudgetId = id,
            TenantId = GetTenantSlug(),
        });

        if (!deleted) return NotFound(new { success = false, message = "Bütçe bulunamadı." });
        return Ok(new { success = true, message = "Bütçe silindi." });
    }

    [HttpPut("{id:guid}/categories")]
    public async Task<IActionResult> SetCategories(Guid id, [FromBody] List<BudgetCategoryAllocationDto> allocations)
    {
        try
        {
            var result = await _mediator.Send(new SetFinanceBudgetCategoryAllocationsCommand
            {
                BudgetId = id,
                TenantId = GetTenantSlug(),
                Allocations = allocations,
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/recalculate")]
    public async Task<IActionResult> Recalculate(Guid id)
    {
        try
        {
            await _mediator.Send(new RecalculateFinanceBudgetSpentCommand
            {
                BudgetId = id,
                TenantId = GetTenantSlug(),
            });
            return Ok(new { success = true, message = "Bütçe harcamaları yeniden hesaplandı." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }
}
