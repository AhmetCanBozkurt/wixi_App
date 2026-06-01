using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Finance.Application.Transactions.Commands.CreateFinanceTransaction;
using Wixi.Modules.Finance.Application.Transactions.Commands.UpdateFinanceTransaction;
using Wixi.Modules.Finance.Application.Transactions.Commands.DeleteFinanceTransaction;
using Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTransactions;
using Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTransactionById;
using Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTotalByType;
using Wixi.Modules.Finance.Application.Transactions.Dto;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.API.Controllers.Finance;

[ApiController]
[Route("api/v1/finance/transactions")]
[Authorize]
public class FinanceTransactionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FinanceTransactionsController(IMediator mediator) => _mediator = mediator;

    private string GetTenantSlug() => Request.Headers["X-Tenant-Slug"].ToString();

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] FinanceTransactionType? type = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? search = null)
    {
        var result = await _mediator.Send(new GetFinanceTransactionsQuery
        {
            TenantId = GetTenantSlug(),
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
            var result = await _mediator.Send(new GetFinanceTransactionByIdQuery
            {
                TransactionId = id,
                TenantId = GetTenantSlug(),
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("total")]
    public async Task<IActionResult> GetTotal(
        [FromQuery] FinanceTransactionType type,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var total = await _mediator.Send(new GetFinanceTotalByTypeQuery
        {
            TenantId = GetTenantSlug(),
            Type = type,
            From = from,
            To = to,
        });
        return Ok(new { success = true, data = new { total, type } });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFinanceTransactionDto dto)
    {
        try
        {
            var result = await _mediator.Send(new CreateFinanceTransactionCommand
            {
                TenantId = GetTenantSlug(),
                Dto = dto,
            });
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFinanceTransactionDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdateFinanceTransactionCommand
            {
                TransactionId = id,
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
        var deleted = await _mediator.Send(new DeleteFinanceTransactionCommand
        {
            TransactionId = id,
            TenantId = GetTenantSlug(),
        });

        if (!deleted) return NotFound(new { success = false, message = "İşlem bulunamadı." });
        return Ok(new { success = true, message = "İşlem silindi." });
    }
}
