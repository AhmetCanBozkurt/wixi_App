using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Customers.Commands.Register;
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
    public async Task<IActionResult> Register([FromBody] RegisterCustomerCommand command)
    {
        Console.WriteLine($"[AUTH] Register request received for: {command.Email}");
        try
        {
            var customerId = await _mediator.Send(command);
            Console.WriteLine($"[AUTH] Register success for: {command.Email}, ID: {customerId}");
            return StatusCode(201, new { message = "Hesabınız başarıyla oluşturuldu.", id = customerId });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AUTH ERROR] Register failed: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"[INNER ERROR] {ex.InnerException.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
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
}
