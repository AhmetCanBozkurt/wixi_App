using MediatR;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.ImportUserMenus;

public record ImportUserMenusCommand(Guid TargetUserId, Guid SourceUserId, bool ReplaceTarget = true) : IRequest<bool>;

