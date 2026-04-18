using System.Security.Cryptography;
using System.Text;

namespace Wixi.Modules.Core.Application.Auth.Services;

public static class OtpHasher
{
    public static string CreateSalt()
    {
        var bytes = RandomNumberGenerator.GetBytes(16);
        return Convert.ToHexString(bytes);
    }

    public static string Hash(string pepper, string sessionToken, string otpCode, string salt)
    {
        var payload = Encoding.UTF8.GetBytes($"{pepper}\n{sessionToken}\n{otpCode}\n{salt}");
        var hash = SHA256.HashData(payload);
        return Convert.ToHexString(hash);
    }

    public static bool Verify(string pepper, string sessionToken, string otpCode, string salt, string expectedHexHash)
    {
        if (string.IsNullOrEmpty(expectedHexHash) || expectedHexHash.Length % 2 != 0)
            return false;

        var computed = Hash(pepper, sessionToken, otpCode, salt);
        try
        {
            var a = Convert.FromHexString(computed);
            var b = Convert.FromHexString(expectedHexHash);
            return a.Length == b.Length && CryptographicOperations.FixedTimeEquals(a, b);
        }
        catch
        {
            return false;
        }
    }
}
