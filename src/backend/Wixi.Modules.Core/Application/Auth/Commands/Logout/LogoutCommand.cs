using MediatR;
using Wixi.Modules.Core.Application.Auth.Dto;

namespace Wixi.Modules.Core.Application.Auth.Commands.Logout;

public class LogoutCommand : IRequest<AuthResult>
{
}

