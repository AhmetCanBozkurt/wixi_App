using Microsoft.Extensions.Options;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Auth.Services;

public interface IOtpPepperProvider
{
    string Pepper { get; }
}

public class OtpPepperProvider : IOtpPepperProvider
{
    public OtpPepperProvider(IOptions<AuthSecurityOptions> authOptions, IOptions<JwtOptions> jwtOptions)
    {
        var a = authOptions.Value;
        if (!string.IsNullOrWhiteSpace(a.OtpPepper))
        {
            Pepper = a.OtpPepper;
            return;
        }

        if (a.FallbackOtpPepperToJwtSecret && !string.IsNullOrWhiteSpace(jwtOptions.Value.SecretKey))
        {
            Pepper = jwtOptions.Value.SecretKey;
            return;
        }

        Pepper = "DEV_ONLY_CHANGE_AUTHSECURITY_OTPPEPPER";
    }

    public string Pepper { get; }
}
