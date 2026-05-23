using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.PersonalFinance.Application.Transactions.Commands.CreatePersonalTransaction;
using Wixi.Modules.PersonalFinance.Application.Transactions.Commands.UpdatePersonalTransaction;
using Wixi.Modules.PersonalFinance.Application.Transactions.Commands.DeletePersonalTransaction;
using Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactions;
using Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactionById;
using Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactionsByDateRange;
using Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTotalByType;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.API.Controllers.PersonalFinance;

[ApiController]
[Route("api/v1/me/finance/transactions")]
[Authorize]
public class PersonalTransactionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUser;

    public PersonalTransactionsController(IMediator mediator, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    private Guid GetUserId() => Guid.Parse(_currentUser.UserId!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] PersonalTransactionType? type = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? search = null)
    {
        var result = await _mediator.Send(new GetPersonalTransactionsQuery
        {
            UserId = GetUserId(),
            Page = page,
            PageSize = pageSize,
            Type = type,
            CategoryId = categoryId,
            From = from,
            To = to,
            Search = search,
        });
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new GetPersonalTransactionByIdQuery
            {
                TransactionId = id,
                UserId = GetUserId(),
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("by-date-range")]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var result = await _mediator.Send(new GetPersonalTransactionsByDateRangeQuery
        {
            UserId = GetUserId(),
            From = from,
            To = to,
        });
        return Ok(new { success = true, data = result });
    }

    [HttpGet("total")]
    public async Task<IActionResult> GetTotal(
        [FromQuery] PersonalTransactionType type,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var total = await _mediator.Send(new GetPersonalTotalByTypeQuery
        {
            UserId = GetUserId(),
            Type = type,
            From = from,
            To = to,
        });
        return Ok(new { success = true, data = new { total, type } });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePersonalTransactionDto dto)
    {
        try
        {
            var result = await _mediator.Send(new CreatePersonalTransactionCommand
            {
                Dto = dto,
                UserId = GetUserId(),
            });
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePersonalTransactionDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdatePersonalTransactionCommand
            {
                TransactionId = id,
                Dto = dto,
                UserId = GetUserId(),
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
        var deleted = await _mediator.Send(new DeletePersonalTransactionCommand
        {
            TransactionId = id,
            UserId = GetUserId(),
        });

        if (!deleted) return NotFound(new { success = false, message = "İşlem bulunamadı." });
        return Ok(new { success = true, message = "İşlem silindi." });
    }
}
