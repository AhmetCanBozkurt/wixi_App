using System.ComponentModel.DataAnnotations;

namespace wixi.Identity.DTOs;

public class RefreshTokenDto
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}

