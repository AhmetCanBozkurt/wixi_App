using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Shared.Configuration;
using Wixi.Shared.Infrastructure.Services;

namespace Wixi.Modules.Core.Infrastructure.Services;

/// <summary>
/// DB'deki şifreli Iyzipay key'lerini çözerek IyzipayService'i çalıştıran wrapper.
/// appsettings.json değerleri yalnızca DB'de kayıt yoksa kullanılır.
/// </summary>
public class DbAwareIyzipayService : IIyzipayService
{
    private readonly IPaymentSettingsProvider _settingsProvider;
    private IyzipayService? _resolved;

    public DbAwareIyzipayService(IPaymentSettingsProvider settingsProvider)
    {
        _settingsProvider = settingsProvider;
    }

    private async Task<IyzipayService> GetServiceAsync(CancellationToken ct)
    {
        if (_resolved is not null) return _resolved;
        var opts = await _settingsProvider.GetIyzipayOptionsAsync(ct);
        _resolved = new IyzipayService(opts);
        return _resolved;
    }

    public async Task<IyzipayCheckoutResult> CreateCheckoutFormAsync(
        string conversationId, decimal price, decimal paidPrice, string currency,
        string buyerName, string buyerSurname, string buyerEmail,
        string buyerGsmNumber, string buyerIdentityNumber,
        string shippingAddress, string billingAddress,
        List<(string id, string name, decimal price, string category)> basketItems,
        string callbackUrl, CancellationToken ct = default)
    {
        var svc = await GetServiceAsync(ct);
        return await svc.CreateCheckoutFormAsync(
            conversationId, price, paidPrice, currency,
            buyerName, buyerSurname, buyerEmail,
            buyerGsmNumber, buyerIdentityNumber,
            shippingAddress, billingAddress, basketItems,
            callbackUrl, ct);
    }

    public async Task<IyzipayPaymentResult> RetrieveCheckoutFormAsync(
        string token, CancellationToken ct = default)
    {
        var svc = await GetServiceAsync(ct);
        return await svc.RetrieveCheckoutFormAsync(token, ct);
    }
}
