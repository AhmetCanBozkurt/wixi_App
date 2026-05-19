using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.ResetUserPassword;

public record ResetUserPasswordCommand(Guid UserId, string NewPassword) : IRequest<bool>;

public class ResetUserPasswordCommandHandler : IRequestHandler<ResetUserPasswordCommand, bool>
{
    private readonly UserManager<WixiUser> _userManager;

    public ResetUserPasswordCommandHandler(UserManager<WixiUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(ResetUserPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return false;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
        return result.Succeeded;
    }
}
