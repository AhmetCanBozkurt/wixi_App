using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.PersonalFinance.Application.Budgets.Commands.CreatePersonalBudget;
using Wixi.Modules.PersonalFinance.Application.Budgets.Commands.UpdatePersonalBudget;
using Wixi.Modules.PersonalFinance.Application.Budgets.Commands.DeletePersonalBudget;
using Wixi.Modules.PersonalFinance.Application.Budgets.Commands.SetBudgetCategoryAllocations;
using Wixi.Modules.PersonalFinance.Application.Budgets.Commands.RecalculateBudgetSpent;
using Wixi.Modules.PersonalFinance.Application.Budgets.Queries.GetPersonalBudgets;
using Wixi.Modules.PersonalFinance.Application.Budgets.Queries.GetPersonalBudgetById;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.API.Controllers.PersonalFinance;

[ApiController]
[Route("api/v1/me/finance/budgets")]
[Authorize]
public class PersonalBudgetsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUser;

    public PersonalBudgetsController(IMediator mediator, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    private Guid GetUserId() => Guid.Parse(_currentUser.UserId!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] BudgetStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetPersonalBudgetsQuery
        {
            UserId = GetUserId(),
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
            var result = await _mediator.Send(new GetPersonalBudgetByIdQuery
            {
                BudgetId = id,
                UserId = GetUserId(),
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePersonalBudgetDto dto)
    {
        try
        {
            var result = await _mediator.Send(new CreatePersonalBudgetCommand
            {
                UserId = GetUserId(),
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePersonalBudgetDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdatePersonalBudgetCommand
            {
                BudgetId = id,
                UserId = GetUserId(),
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
        var deleted = await _mediator.Send(new DeletePersonalBudgetCommand
        {
            BudgetId = id,
            UserId = GetUserId(),
        });

        if (!deleted) return NotFound(new { success = false, message = "Bütçe bulunamadı." });
        return Ok(new { success = true, message = "Bütçe silindi." });
    }

    [HttpPut("{id:guid}/categories")]
    public async Task<IActionResult> SetCategories(Guid id, [FromBody] List<BudgetCategoryAllocationDto> allocations)
    {
        try
        {
            var result = await _mediator.Send(new SetBudgetCategoryAllocationsCommand
            {
                BudgetId = id,
                UserId = GetUserId(),
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
            await _mediator.Send(new RecalculateBudgetSpentCommand
            {
                BudgetId = id,
                UserId = GetUserId(),
            });
            return Ok(new { success = true, message = "Bütçe harcamaları yeniden hesaplandı." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }
}
