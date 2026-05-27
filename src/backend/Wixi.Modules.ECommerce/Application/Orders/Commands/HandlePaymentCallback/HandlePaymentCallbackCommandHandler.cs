using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Modules.ECommerce.Infrastructure.Services;

namespace Wixi.Modules.ECommerce.Application.Orders.Commands.HandlePaymentCallback;

public class HandlePaymentCallbackCommandHandler : IRequestHandler<HandlePaymentCallbackCommand, HandlePaymentCallbackResult>
{
    private readonly ECommerceDbContext _db;
    private readonly IIyzipayService _iyzipay;

    public HandlePaymentCallbackCommandHandler(ECommerceDbContext db, IIyzipayService iyzipay)
    {
        _db = db;
        _iyzipay = iyzipay;
    }

    public async Task<HandlePaymentCallbackResult> Handle(HandlePaymentCallbackCommand request, CancellationToken ct)
    {
        // 1. PaymentLog'u token ile bul
        var log = await _db.PaymentLogs
            .FirstOrDefaultAsync(l => l.Token == request.Token, ct);

        if (log == null)
            return new HandlePaymentCallbackResult(false, string.Empty, "Ödeme kaydı bulunamadı.");

        // 2. Iyzipay'den ödeme durumunu sorgula
        var paymentResult = await _iyzipay.RetrieveCheckoutFormAsync(request.Token, ct);

        // 3. İlgili siparişi bul
        var order = await _db.Orders
            .FirstOrDefaultAsync(o => o.Id == log.OrderId, ct);

        if (order == null)
            return new HandlePaymentCallbackResult(false, string.Empty, "Sipariş bulunamadı.");

        log.UpdatedAt = DateTime.UtcNow;

        if (paymentResult.Success)
        {
            // Başarılı ödeme
            log.Status = PaymentLogStatus.Success;
            log.PaymentId = paymentResult.PaymentId;
            order.Status = OrderStatus.Paid;
        }
        else
        {
            // Başarısız ödeme
            log.Status = PaymentLogStatus.Failed;
            log.ErrorMessage = paymentResult.ErrorMessage;
            order.Status = OrderStatus.Cancelled;
        }

        _db.PaymentLogs.Update(log);
        _db.Orders.Update(order);
        await _db.SaveChangesAsync(ct);

        return new HandlePaymentCallbackResult(paymentResult.Success, order.OrderNumber, paymentResult.ErrorMessage);
    }
}
