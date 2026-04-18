using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.UserManagement.Dto;

public class UserListDto : AuditableDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public byte[]? ProfilePicture { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<Guid> Menus { get; set; } = new();
}
