namespace Wixi.Modules.Core.Application.UserManagement.Dto;

public class UserDetailDto
{
    public Guid? Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public byte[]? ProfilePicture { get; set; }
    public string? PhoneNumber { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public string? Password { get; set; }

    public List<string> Roles { get; set; } = new();
}
