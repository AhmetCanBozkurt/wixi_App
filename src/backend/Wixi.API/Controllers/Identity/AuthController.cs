using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Wixi.Modules.Core.Application.Auth.Commands.Login;
using Wixi.Modules.Core.Application.Auth.Commands.Register;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Application.Auth.Queries.GetMe;
using Wixi.Modules.Core.Application.Auth.Commands.VerifyTwoFactor;
using Wixi.Modules.Core.Application.Auth.Commands.ResendTwoFactor;
using Wixi.Modules.Core.Application.Auth.Commands.RefreshToken;
using Wixi.Modules.Core.Application.Auth.Commands.ForgotPassword;
using Wixi.Modules.Core.Application.Auth.Commands.ResetPassword;
using Wixi.Modules.Core.Application.Auth.Commands.Logout;
using Wixi.Modules.Core.Application.Auth.Commands.LogoutAll;

namespace Wixi.API.Controllers.Identity;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly WixiCoreDbContext _context;

    public AuthController(IMediator mediator, WixiCoreDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var result = await _mediator.Send(new LogoutCommand());
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });

        await _context.LogActivityAsync("LOGOUT", null, null, "Kullanıcı oturumu sonlandırdı.", LogType.Security);
        return Ok(new { message = "Oturum başarıyla kapatıldı." });
    }

    [Authorize]
    [HttpPost("logout-all")]
    [EnableRateLimiting("auth_logout_all")]
    public async Task<IActionResult> LogoutAllDevices()
    {
        var result = await _mediator.Send(new LogoutAllCommand());
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });

        await _context.LogActivityAsync("LOGOUT_ALL", null, null, "Kullanıcı tüm cihazlardan çıkış yaptı.", LogType.Security);
        return Ok(new { message = "Tüm oturumlar sonlandırıldı." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var result = await _mediator.Send(new GetMeQuery());
        return result != null ? Ok(result) : NotFound();
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth_login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success)
        {
            return Unauthorized(new { error = result.ErrorMessage });
        }

        if (result.RequiresTwoFactor)
        {
            return Ok(new
            {
                requiresTwoFactor = true,
                twoFactorToken = result.TwoFactorToken
            });
        }

        return Ok(new
        {
            requiresTwoFactor = false,
            token = result.Token,
            accessToken = result.Token
        });
    }

    [AllowAnonymous]
    [HttpPost("verify-2fa")]
    [EnableRateLimiting("auth_verify_2fa")]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return Unauthorized(new { error = result.ErrorMessage });

        return Ok(new
        {
            token = result.Token,
            accessToken = result.Token
        });
    }

    [AllowAnonymous]
    [HttpPost("resend-2fa")]
    [EnableRateLimiting("auth_resend_2fa")]
    public async Task<IActionResult> ResendTwoFactor([FromBody] ResendTwoFactorCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });
        return Ok(new { success = true });
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    [EnableRateLimiting("auth_refresh")]
    public async Task<IActionResult> Refresh()
    {
        var result = await _mediator.Send(new RefreshTokenCommand());
        if (!result.Success) return Unauthorized(new { error = result.ErrorMessage });

        return Ok(new
        {
            token = result.Token,
            accessToken = result.Token
        });
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth_forgot_password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });
        return Ok(new
        {
            success = true,
            message = "Eğer bu adres için bir hesap varsa, şifre sıfırlama bağlantısı gönderildi."
        });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    [EnableRateLimiting("auth_reset_password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });
        return Ok(new { success = true });
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth_register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }
        return StatusCode(201, new { message = "Kullanıcı başarıyla oluşturuldu.", id = result.UserId });
    }
}
