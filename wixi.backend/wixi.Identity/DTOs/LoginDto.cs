using System.ComponentModel.DataAnnotations;

namespace wixi.Identity.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "Username or Email is required")]
    public string UserNameOrEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = string.Empty;

    public string? TwoFactorCode { get; set; }
}
