using Iyzipay;

namespace wixi.WebAPI.Configuration;

/// <summary>
/// Iyzico configuration options
/// </summary>
public class IyzicoOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string CallbackUrl { get; set; } = string.Empty;
    
    /// <summary>
    /// Convert to Iyzico Options
    /// </summary>
    public Options ToIyzipayOptions()
    {
        return new Options
        {
            ApiKey = ApiKey,
            SecretKey = SecretKey,
            BaseUrl = BaseUrl
        };
    }
}

