using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Modules.ECommerce.Infrastructure.Services;

namespace Wixi.Modules.ECommerce.Application.Orders.Commands.InitiatePayment;

public class InitiatePaymentCommandHandler : IRequestHandler<InitiatePaymentCommand, InitiatePaymentResult>
{
    private readonly ECommerceDbContext _db;
    private readonly IIyzipayService _iyzipay;

    public InitiatePaymentCommandHandler(ECommerceDbContext db, IIyzipayService iyzipay)
    {
        _db = db;
        _iyzipay = iyzipay;
    }

    public async Task<InitiatePaymentResult> Handle(InitiatePaymentCommand request, CancellationToken ct)
    {
        // 1. Order'ı bul ve sahipliği doğrula
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.CustomerId == request.CustomerId, ct);

        if (order == null)
            return new InitiatePaymentResult(false, null, null, "Sipariş bulunamadı.");

        // 2. Sadece Pending siparişler ödemeye açılabilir
        if (order.Status != OrderStatus.Pending)
            return new InitiatePaymentResult(false, null, null, $"Sipariş ödemeye uygun durumda değil: {order.Status}");

        var conversationId = order.Id.ToString("N");

        // 3. Sepet kalemlerini oluştur
        var basketItems = order.Items.Select(item => (
            id: item.Id.ToString("N"),
            name: item.ProductName,
            price: item.TotalPrice,
            category: "Genel"
        )).ToList();

        // 4. Iyzipay checkout form oluştur
        var formResult = await _iyzipay.CreateCheckoutFormAsync(
            conversationId: conversationId,
            price: order.TotalAmount,
            paidPrice: order.TotalAmount,
            currency: order.Currency,
            buyerName: request.BuyerName,
            buyerSurname: request.BuyerSurname,
            buyerEmail: request.BuyerEmail,
            buyerGsmNumber: request.BuyerPhone ?? string.Empty,
            buyerIdentityNumber: string.Empty,
            shippingAddress: order.ShippingAddress,
            billingAddress: order.BillingAddress,
            basketItems: basketItems,
            callbackUrl: request.CallbackUrl,
            ct: ct);

        // 5. PaymentLog oluştur
        var log = new WixiPaymentLog
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Gateway = "Iyzipay",
            ConversationId = conversationId,
            Token = formResult.Token,
            Amount = order.TotalAmount,
            Currency = order.Currency,
            Status = formResult.Success ? PaymentLogStatus.Initiated : PaymentLogStatus.Failed,
            ErrorMessage = formResult.Success ? null : formResult.ErrorMessage,
            CreatedAt = DateTime.UtcNow
        };
        _db.PaymentLogs.Add(log);

        if (formResult.Success)
        {
            // 6. Order'a token kaydet
            order.PaymentToken = formResult.Token;
            order.PaymentGateway = "Iyzipay";
            _db.Orders.Update(order);
        }

        await _db.SaveChangesAsync(ct);

        if (!formResult.Success)
            return new InitiatePaymentResult(false, null, null, formResult.ErrorMessage);

        return new InitiatePaymentResult(true, formResult.CheckoutFormContent, formResult.Token, null);
    }
}
