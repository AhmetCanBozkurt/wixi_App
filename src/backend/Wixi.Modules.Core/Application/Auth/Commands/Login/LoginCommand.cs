using MediatR;
using Wixi.Modules.Core.Application.Auth.Dto;

namespace Wixi.Modules.Core.Application.Auth.Commands.Login;

public class LoginCommand : IRequest<AuthResult>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = false;
}
