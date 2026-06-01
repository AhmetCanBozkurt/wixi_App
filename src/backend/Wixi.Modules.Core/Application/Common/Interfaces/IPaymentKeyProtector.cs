namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IPaymentKeyProtector
{
    string Protect(string plaintext);
    string? Unprotect(string? ciphertext);
}
