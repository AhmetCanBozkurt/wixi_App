using MediatR;
using Wixi.Modules.Core.Application.Auth.Dto;

namespace Wixi.Modules.Core.Application.Auth.Commands.LogoutAll;

public class LogoutAllCommand : IRequest<AuthResult>
{
}
