using Iyzipay.Model;
using Iyzipay.Request;
using Microsoft.Extensions.Options;
using Wixi.Shared.Configuration;

namespace Wixi.Shared.Infrastructure.Services;

// ── Result Records ────────────────────────────────────────────────────────────
public record IyzipayCheckoutResult(bool Success, string? CheckoutFormContent, string? Token, string? ErrorMessage);
public record IyzipayPaymentResult(bool Success, string? PaymentId, string? ConversationId, string? ErrorMessage, string? PaymentStatus);

// ── Interface ─────────────────────────────────────────────────────────────────
public interface IIyzipayService
{
    Task<IyzipayCheckoutResult> CreateCheckoutFormAsync(
        string conversationId,
        decimal price,
        decimal paidPrice,
        string currency,
        string buyerName,
        string buyerSurname,
        string buyerEmail,
        string buyerGsmNumber,
        string buyerIdentityNumber,
        string shippingAddress,
        string billingAddress,
        List<(string id, string name, decimal price, string category)> basketItems,
        string callbackUrl,
        CancellationToken ct = default);

    Task<IyzipayPaymentResult> RetrieveCheckoutFormAsync(string token, CancellationToken ct = default);
}

// ── Implementation ────────────────────────────────────────────────────────────
public class IyzipayService : IIyzipayService
{
    private readonly Iyzipay.Options _options;

    public IyzipayService(IOptions<IyzipayOptions> opts)
    {
        var o = opts.Value;
        _options = new Iyzipay.Options
        {
            ApiKey = o.ApiKey,
            SecretKey = o.SecretKey,
            BaseUrl = o.BaseUrl
        };
    }

    public async Task<IyzipayCheckoutResult> CreateCheckoutFormAsync(
        string conversationId,
        decimal price,
        decimal paidPrice,
        string currency,
        string buyerName,
        string buyerSurname,
        string buyerEmail,
        string buyerGsmNumber,
        string buyerIdentityNumber,
        string shippingAddress,
        string billingAddress,
        List<(string id, string name, decimal price, string category)> basketItems,
        string callbackUrl,
        CancellationToken ct = default)
    {
        try
        {
            var request = new CreateCheckoutFormInitializeRequest
            {
                Locale = "tr",
                ConversationId = conversationId,
                Price = price.ToString("F2"),
                PaidPrice = paidPrice.ToString("F2"),
                Currency = currency == "TRY" ? "TRY" : currency,
                BasketId = conversationId,
                PaymentGroup = "PRODUCT",
                CallbackUrl = callbackUrl,
                EnabledInstallments = new List<int> { 1, 2, 3, 6, 9, 12 }
            };

            // Buyer
            request.Buyer = new Buyer
            {
                Id = conversationId,
                Name = buyerName,
                Surname = buyerSurname,
                Email = buyerEmail,
                GsmNumber = string.IsNullOrWhiteSpace(buyerGsmNumber) ? "+905000000000" : buyerGsmNumber,
                IdentityNumber = string.IsNullOrWhiteSpace(buyerIdentityNumber) ? "00000000000" : buyerIdentityNumber,
                RegistrationDate = "2024-01-01 00:00:00",
                LastLoginDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                RegistrationAddress = shippingAddress,
                Ip = "85.34.78.112",
                City = "Istanbul",
                Country = "Turkey"
            };

            // Addresses
            request.ShippingAddress = new Iyzipay.Model.Address
            {
                ContactName = $"{buyerName} {buyerSurname}",
                City = "Istanbul",
                Country = "Turkey",
                Description = shippingAddress,
                ZipCode = "34000"
            };
            request.BillingAddress = new Iyzipay.Model.Address
            {
                ContactName = $"{buyerName} {buyerSurname}",
                City = "Istanbul",
                Country = "Turkey",
                Description = billingAddress,
                ZipCode = "34000"
            };

            // Basket items
            request.BasketItems = basketItems.Select(b => new BasketItem
            {
                Id = b.id,
                Name = b.name,
                Category1 = b.category,
                ItemType = "PHYSICAL",
                Price = b.price.ToString("F2")
            }).ToList();

            var form = await Task.Run(() =>
                CheckoutFormInitialize.Create(request, _options), ct);

            if (form.Status == "success")
                return new IyzipayCheckoutResult(true, form.CheckoutFormContent, form.Token, null);

            return new IyzipayCheckoutResult(false, null, null, form.ErrorMessage ?? form.ErrorCode);
        }
        catch (Exception ex)
        {
            return new IyzipayCheckoutResult(false, null, null, ex.Message);
        }
    }

    public async Task<IyzipayPaymentResult> RetrieveCheckoutFormAsync(string token, CancellationToken ct = default)
    {
        try
        {
            var request = new RetrieveCheckoutFormRequest { Token = token };
            var result = await Task.Run(() =>
                CheckoutForm.Retrieve(request, _options), ct);

            if (result.Status == "success" && result.PaymentStatus == "SUCCESS")
                return new IyzipayPaymentResult(true, result.PaymentId, result.ConversationId, null, result.PaymentStatus);

            return new IyzipayPaymentResult(false, null, result.ConversationId, result.ErrorMessage ?? result.PaymentStatus, result.PaymentStatus);
        }
        catch (Exception ex)
        {
            return new IyzipayPaymentResult(false, null, null, ex.Message, null);
        }
    }
}
