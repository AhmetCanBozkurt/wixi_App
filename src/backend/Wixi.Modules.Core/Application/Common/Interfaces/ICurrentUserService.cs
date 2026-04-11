using System.Security.Claims;

namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    string? FullName { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
}
