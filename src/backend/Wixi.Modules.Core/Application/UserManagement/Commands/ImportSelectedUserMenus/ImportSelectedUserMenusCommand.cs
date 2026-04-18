using MediatR;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.ImportSelectedUserMenus;

public record ImportSelectedUserMenusCommand(
    Guid TargetUserId,
    Guid SourceUserId,
    List<Guid> MenuIds,
    bool ReplaceTarget = false) : IRequest<bool>;

