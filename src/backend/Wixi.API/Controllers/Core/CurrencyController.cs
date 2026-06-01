using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Wixi.Modules.Core.Application.Currencies.Commands.CreateCurrency;
using Wixi.Modules.Core.Application.Currencies.Commands.DeleteCurrency;
using Wixi.Modules.Core.Application.Currencies.Commands.SetBaseCurrency;
using Wixi.Modules.Core.Application.Currencies.Commands.SyncTcmbRates;
using Wixi.Modules.Core.Application.Currencies.Commands.UpdateCurrency;
using Wixi.Modules.Core.Application.Currencies.Commands.UpdateCurrencySettings;
using Wixi.Modules.Core.Application.Currencies.Queries.ConvertAmount;
using Wixi.Modules.Core.Application.Currencies.Queries.GetCrossParity;
using Wixi.Modules.Core.Application.Currencies.Queries.GetCurrencies;
using Wixi.Modules.Core.Application.Currencies.Queries.GetCurrencySettings;
using Wixi.Modules.Core.Application.Currencies.Queries.GetExchangeRates;
using Wixi.Modules.Core.Application.Currencies.Queries.GetLatestRates;
using Wixi.Modules.Core.Application.Currencies.Queries.GetParity;

namespace Wixi.API.Controllers.Core;

[ApiController]
[Authorize]
public class CurrencyController : ControllerBase
{
    private readonly IMediator _mediator;

    public CurrencyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // ── Currency CRUD ─────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("api/v1/currency")]
    public async Task<IActionResult> GetCurrencies([FromQuery] bool activeOnly = false)
    {
        var result = await _mediator.Send(new GetCurrenciesQuery(activeOnly));
        return Ok(new { items = result });
    }

    [AllowAnonymous]
    [HttpGet("api/v1/currency/{id:guid}")]
    public async Task<IActionResult> GetCurrency(Guid id)
    {
        var result = await _mediator.Send(new GetCurrenciesQuery(false));
        var currency = result.FirstOrDefault(c => c.Id == id);
        return currency is null ? NotFound() : Ok(currency);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("api/v1/currency")]
    public async Task<IActionResult> Create([FromBody] CreateCurrencyCommand command)
    {
        try
        {
            var id = await _mediator.Send(command);
            return Ok(id);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("api/v1/currency")]
    public async Task<IActionResult> Update([FromBody] UpdateCurrencyCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return result ? Ok() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("api/v1/currency/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new DeleteCurrencyCommand(id));
            return result ? Ok() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("api/v1/currency/set-base/{id:guid}")]
    public async Task<IActionResult> SetBase(Guid id)
    {
        var result = await _mediator.Send(new SetBaseCurrencyCommand(id));
        return result ? Ok() : NotFound();
    }

    // ── Currency Settings ─────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("api/v1/currency/settings")]
    public async Task<IActionResult> GetSettings()
    {
        var result = await _mediator.Send(new GetCurrencySettingsQuery());
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("api/v1/currency/settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateCurrencySettingsCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    // ── Exchange Rates ─────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("api/v1/exchange-rates")]
    public async Task<IActionResult> GetExchangeRates(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? currencyCode,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetExchangeRatesQuery(fromDate, toDate, currencyCode, page, pageSize));
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("api/v1/exchange-rates/latest")]
    public async Task<IActionResult> GetLatestRates([FromQuery] DateTime? date)
    {
        var result = await _mediator.Send(new GetLatestRatesQuery(date));
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [EnableRateLimiting("currency_sync")]
    [HttpPost("api/v1/exchange-rates/sync-tcmb")]
    public async Task<IActionResult> SyncTcmb([FromBody] SyncTcmbRequest? request)
    {
        DateTime? date = null;
        if (!string.IsNullOrWhiteSpace(request?.Date) && DateTime.TryParse(request.Date, out var parsedDate))
        {
            date = parsedDate;
        }

        var result = await _mediator.Send(new SyncTcmbRatesCommand(date));
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("api/v1/exchange-rates/parity")]
    public async Task<IActionResult> GetParity(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] DateTime? date)
    {
        try
        {
            var result = await _mediator.Send(new GetParityQuery(from, to, date));
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("api/v1/exchange-rates/cross-parity")]
    public async Task<IActionResult> GetCrossParity(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] DateTime? date)
    {
        try
        {
            var result = await _mediator.Send(new GetCrossParityQuery(from, to, date));
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("api/v1/exchange-rates/convert")]
    public async Task<IActionResult> Convert(
        [FromQuery] decimal amount,
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] DateTime? date,
        [FromQuery] string rateField = "ForexSelling")
    {
        try
        {
            var result = await _mediator.Send(new ConvertAmountQuery(amount, from, to, date, rateField));
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class SyncTcmbRequest
{
    public string? Date { get; set; }
}
