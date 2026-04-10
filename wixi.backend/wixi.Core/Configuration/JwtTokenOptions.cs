namespace wixi.Core.Configuration;

public class JwtTokenOptions
{
    public string SecurityKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpiration { get; set; } = 60; // minutes
    public int RefreshTokenExpiration { get; set; } = 10080; // 7 days in minutes
}

