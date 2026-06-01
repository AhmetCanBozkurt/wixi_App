namespace Wixi.Shared.Configuration;

public class IyzipayOptions
{
    public const string SectionName = "Iyzipay";
    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://sandbox-api.iyzipay.com";
}
