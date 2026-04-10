using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Auth.Commands.Login;
using Wixi.Modules.Core.Application.Auth.Commands.Register;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success)
        {
            return Unauthorized(new { error = result.ErrorMessage });
        }
        return Ok(new { token = result.Token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }
        return Ok(new { message = "Kullanıcı başarıyla oluşturuldu." });
    }
}
