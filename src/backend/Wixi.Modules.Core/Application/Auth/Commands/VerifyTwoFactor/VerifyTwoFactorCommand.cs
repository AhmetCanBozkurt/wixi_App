using MediatR;
using Wixi.Modules.Core.Application.Auth.Dto;

namespace Wixi.Modules.Core.Application.Auth.Commands.VerifyTwoFactor;

public class VerifyTwoFactorCommand : IRequest<AuthResult>
{
    public string TwoFactorToken { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = false;
}

