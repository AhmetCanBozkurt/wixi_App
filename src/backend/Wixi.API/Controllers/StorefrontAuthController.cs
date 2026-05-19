using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Wixi.Modules.ECommerce.Application.Customers.Commands.Register;
using Wixi.Modules.ECommerce.Application.Customers.Queries.GetCurrentCustomer;
using Wixi.Modules.ECommerce.Application.Customers.Queries.Login;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/public/storefront/auth")]
public class StorefrontAuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontAuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    [EnableRateLimiting("storefront-auth")]
    public async Task<IActionResult> Register([FromBody] RegisterCustomerCommand command)
    {
        try
        {
            var customerId = await _mediator.Send(command);
            return StatusCode(201, new { message = "Hesabınız başarıyla oluşturuldu.", id = customerId });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    [EnableRateLimiting("storefront-auth")]
    public async Task<IActionResult> Login([FromBody] LoginCustomerQuery query)
    {
        var result = await _mediator.Send(query);
        if (result == null)
        {
            return Unauthorized(new { error = "E-posta veya şifre hatalı." });
        }

        return Ok(new
        {
            token = result.Token,
            customer = new
            {
                id = result.CustomerId,
                firstName = result.FirstName,
                lastName = result.LastName,
                email = result.Email
            }
        });
    }

    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (customerIdStr == null || !Guid.TryParse(customerIdStr, out var customerId))
            return Unauthorized(new { error = "Geçersiz token." });

        var customer = await _mediator.Send(new GetCurrentCustomerQuery(customerId), ct);
        if (customer == null)
            return NotFound(new { error = "Müşteri bulunamadı." });

        return Ok(customer);
    }
}
