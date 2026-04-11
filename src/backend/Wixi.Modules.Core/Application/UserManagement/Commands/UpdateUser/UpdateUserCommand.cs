using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.UpdateUser;

public record UpdateUserCommand(UserDetailDto User) : IRequest<bool>;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly UserManager<WixiUser> _userManager;

    public UpdateUserCommandHandler(UserManager<WixiUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.User.Id.ToString());
        if (user == null) return false;

        user.FirstName = request.User.FirstName;
        user.LastName = request.User.LastName;
        user.Email = request.User.Email;
        user.UserName = request.User.Username;
        user.IsActive = request.User.IsActive;
        
        if (request.User.ProfilePicture != null && request.User.ProfilePicture.Length > 0)
        {
            user.ProfilePicture = request.User.ProfilePicture;
        }

        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }
}
