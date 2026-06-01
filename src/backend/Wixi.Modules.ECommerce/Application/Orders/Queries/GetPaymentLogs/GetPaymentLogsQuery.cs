using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Orders.Queries.GetPaymentLogs;

public record GetPaymentLogsQuery(
    int Page = 1,
    int PageSize = 20,
    string? StatusFilter = null
) : IRequest<GetPaymentLogsResult>;

public record PaymentLogDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    decimal Amount,
    string Currency,
    string Gateway,
    string Status,
    string? ErrorMessage,
    DateTime CreatedAt
);

public record GetPaymentLogsResult(
    List<PaymentLogDto> Items,
    int Total,
    int TotalSuccess,
    int TotalFailed
);

public class GetPaymentLogsQueryHandler : IRequestHandler<GetPaymentLogsQuery, GetPaymentLogsResult>
{
    private readonly ECommerceDbContext _db;

    public GetPaymentLogsQueryHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<GetPaymentLogsResult> Handle(GetPaymentLogsQuery request, CancellationToken ct)
    {
        var query = _db.PaymentLogs
            .AsNoTracking()
            .Include(p => p.Order)
            .ThenInclude(o => o.Customer)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.StatusFilter)
            && Enum.TryParse<PaymentLogStatus>(request.StatusFilter, ignoreCase: true, out var parsedStatus))
        {
            query = query.Where(p => p.Status == parsedStatus);
        }

        var total        = await query.CountAsync(ct);
        var totalSuccess = await _db.PaymentLogs.CountAsync(p => p.Status == PaymentLogStatus.Success, ct);
        var totalFailed  = await _db.PaymentLogs.CountAsync(p => p.Status == PaymentLogStatus.Failed, ct);

        var rawItems = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new
            {
                p.Id,
                OrderNumber  = p.Order.OrderNumber,
                CustomerName = p.Order.Customer.FirstName + " " + p.Order.Customer.LastName,
                p.Amount,
                p.Currency,
                p.Gateway,
                p.Status,
                p.ErrorMessage,
                p.CreatedAt
            })
            .ToListAsync(ct);

        var items = rawItems
            .Select(p => new PaymentLogDto(
                Id:           p.Id,
                OrderNumber:  p.OrderNumber,
                CustomerName: p.CustomerName,
                Amount:       p.Amount,
                Currency:     p.Currency,
                Gateway:      p.Gateway,
                Status:       p.Status.ToString(),
                ErrorMessage: p.ErrorMessage,
                CreatedAt:    p.CreatedAt))
            .ToList();

        return new GetPaymentLogsResult(items, total, totalSuccess, totalFailed);
    }
}
