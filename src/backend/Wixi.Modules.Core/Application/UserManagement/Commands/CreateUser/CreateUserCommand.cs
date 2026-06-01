using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.CreateUser;

public record CreateUserCommand(UserDetailDto User) : IRequest<Guid?>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid?>
{
    private readonly UserManager<WixiUser> _userManager;

    public CreateUserCommandHandler(UserManager<WixiUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Guid?> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new WixiUser
        {
            Id = Guid.NewGuid(),
            FirstName = request.User.FirstName,
            LastName = request.User.LastName,
            Email = request.User.Email,
            UserName = request.User.Username,
            IsActive = request.User.IsActive,
            ProfilePicture = request.User.ProfilePicture,
            PhoneNumber = request.User.PhoneNumber,
            TwoFactorEnabled = request.User.TwoFactorEnabled,
            TenantId = request.User.TenantId,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.User.Password ?? "Wixi.123!");
        
        if (result.Succeeded)
        {
            return user.Id;
        }

        return null;
    }
}
