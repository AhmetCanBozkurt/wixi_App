using MediatR;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.UpdateUserRoles;

public record UpdateUserRolesCommand(Guid UserId, List<string> Roles) : IRequest<bool>;

