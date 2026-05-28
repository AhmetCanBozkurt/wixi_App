using Microsoft.AspNetCore.DataProtection;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class PaymentKeyProtector : IPaymentKeyProtector
{
    private readonly IDataProtector _protector;

    public PaymentKeyProtector(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("Wixi.PaymentGateway.Keys.v1");
    }

    public string Protect(string plaintext) => _protector.Protect(plaintext);

    public string? Unprotect(string? ciphertext)
    {
        if (string.IsNullOrEmpty(ciphertext)) return null;
        try
        {
            return _protector.Unprotect(ciphertext);
        }
        catch
        {
            // Anahtar rotasyonu veya bozuk veri durumunda null döner
            return null;
        }
    }
}
