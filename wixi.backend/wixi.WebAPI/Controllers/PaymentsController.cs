using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Payments.DTOs;
using wixi.Payments.Entities;
using wixi.Payments.Interfaces;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly WixiDbContext _context;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPaymentService paymentService,
        WixiDbContext context,
        ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a new payment (Public - no authentication required)
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
    {
        try
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var payment = await _paymentService.CreatePaymentAsync(dto, clientIp);
            return Ok(new { success = true, data = payment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get payment by ID
    /// </summary>
    [HttpGet("{paymentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPayment(long paymentId)
    {
        try
        {
            var payment = await _paymentService.GetPaymentAsync(paymentId);
            if (payment == null)
            {
                return NotFound(new { success = false, message = "Payment not found" });
            }
            return Ok(new { success = true, data = payment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment {PaymentId}", paymentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get payment by payment number
    /// </summary>
    [HttpGet("number/{paymentNumber}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaymentByNumber(string paymentNumber)
    {
        try
        {
            var payment = await _paymentService.GetPaymentByNumberAsync(paymentNumber);
            if (payment == null)
            {
                return NotFound(new { success = false, message = "Payment not found" });
            }
            return Ok(new { success = true, data = payment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment {PaymentNumber}", paymentNumber);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get payment by Iyzico Payment ID
    /// </summary>
    [HttpGet("iyzico/{iyzicoPaymentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaymentByIyzicoId(string iyzicoPaymentId)
    {
        try
        {
            var payment = await _paymentService.GetPaymentByIyzicoPaymentIdAsync(iyzicoPaymentId);
            if (payment == null)
            {
                return NotFound(new { success = false, message = "Payment not found" });
            }
            return Ok(new { success = true, data = payment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment by Iyzico ID {IyzicoPaymentId}", iyzicoPaymentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get payments by appointment ID
    /// </summary>
    [HttpGet("appointment/{appointmentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaymentsByAppointment(long appointmentId)
    {
        try
        {
            var payments = await _paymentService.GetPaymentsByAppointmentIdAsync(appointmentId);
            return Ok(new { success = true, data = payments, count = payments.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payments for appointment {AppointmentId}", appointmentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get all payments with filtering and pagination (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> GetAllPayments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? status = null,
        [FromQuery] string? paymentNumber = null,
        [FromQuery] string? customerEmail = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.Payments
                .Include(p => p.Items)
                .Include(p => p.Transactions)
                .Include(p => p.Appointment)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<PaymentStatus>(status, out var statusEnum))
            {
                query = query.Where(p => p.Status == statusEnum);
            }

            if (!string.IsNullOrEmpty(paymentNumber))
            {
                query = query.Where(p => p.PaymentNumber.Contains(paymentNumber));
            }

            if (!string.IsNullOrEmpty(customerEmail))
            {
                query = query.Where(p => p.CustomerEmail.Contains(customerEmail));
            }

            if (startDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt <= endDate.Value);
            }

            var total = await query.CountAsync();
            var payments = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var paymentDtos = new List<PaymentDto>();
            foreach (var payment in payments)
            {
                paymentDtos.Add(MapToDto(payment));
            }

            return Ok(new
            {
                success = true,
                data = paymentDtos,
                count = paymentDtos.Count,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all payments");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get payment statistics (Admin only)
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> GetPaymentStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.Payments.AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt <= endDate.Value);
            }

            var totalPayments = await query.CountAsync();
            var completedPayments = await query.CountAsync(p => p.Status == PaymentStatus.Completed);
            var pendingPayments = await query.CountAsync(p => p.Status == PaymentStatus.Pending);
            var failedPayments = await query.CountAsync(p => p.Status == PaymentStatus.Failed);
            var totalAmount = await query.Where(p => p.Status == PaymentStatus.Completed).SumAsync(p => p.PaidAmount);
            var totalAmountPending = await query.Where(p => p.Status == PaymentStatus.Pending).SumAsync(p => p.Amount);

            return Ok(new
            {
                success = true,
                data = new
                {
                    totalPayments,
                    completedPayments,
                    pendingPayments,
                    failedPayments,
                    totalAmount,
                    totalAmountPending,
                    successRate = totalPayments > 0 ? (double)completedPayments / totalPayments * 100 : 0
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment statistics");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Check payment status
    /// </summary>
    [HttpGet("{paymentId}/status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaymentStatus(long paymentId)
    {
        try
        {
            var payment = await _paymentService.GetPaymentAsync(paymentId);
            if (payment == null)
            {
                return NotFound(new { success = false, message = "Payment not found" });
            }
            return Ok(new
            {
                success = true,
                data = new
                {
                    paymentId = payment.Id,
                    paymentNumber = payment.PaymentNumber,
                    status = payment.Status,
                    amount = payment.Amount,
                    paidAmount = payment.PaidAmount,
                    currency = payment.Currency,
                    createdAt = payment.CreatedAt,
                    paidAt = payment.PaidAt
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment status {PaymentId}", paymentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Cancel payment (Admin only)
    /// </summary>
    [HttpPost("{paymentId}/cancel")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> CancelPayment(long paymentId, [FromBody] CancelPaymentRequest? request = null)
    {
        try
        {
            var result = await _paymentService.CancelPaymentAsync(paymentId, request?.Reason);
            if (result)
            {
                return Ok(new { success = true, message = "Payment cancelled successfully" });
            }
            return BadRequest(new { success = false, message = "Failed to cancel payment" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling payment {PaymentId}", paymentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Refund payment (Admin only)
    /// </summary>
    [HttpPost("{paymentId}/refund")]
    [Authorize(Policy = Policies.AdminOnly)]
    public async Task<IActionResult> RefundPayment(long paymentId, [FromBody] RefundPaymentRequest request)
    {
        try
        {
            var result = await _paymentService.RefundPaymentAsync(paymentId, request.Amount, request.Reason);
            if (result)
            {
                return Ok(new { success = true, message = "Payment refunded successfully" });
            }
            return BadRequest(new { success = false, message = "Failed to refund payment" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding payment {PaymentId}", paymentId);
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Iyzico webhook endpoint
    /// </summary>
    [HttpPost("webhooks/iyzico")]
    [AllowAnonymous]
    public async Task<IActionResult> IyzicoWebhook([FromBody] WebhookPayload payload)
    {
        try
        {
            await _paymentService.ProcessWebhookAsync(payload);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Helper method to map Payment entity to DTO
    /// </summary>
    private PaymentDto MapToDto(Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            PaymentNumber = payment.PaymentNumber,
            PaymentProvider = payment.PaymentProvider,
            ProviderPaymentId = payment.ProviderPaymentId,
            ConversationId = payment.ConversationId,
            CustomerName = payment.CustomerName,
            CustomerEmail = payment.CustomerEmail,
            CustomerPhone = payment.CustomerPhone,
            CustomerIdentityNumber = payment.CustomerIdentityNumber,
            Amount = payment.Amount,
            PaidAmount = payment.PaidAmount,
            Currency = payment.Currency,
            ExchangeRate = payment.ExchangeRate,
                Status = payment.Status != null ? payment.Status.ToString() : "Pending",
            Type = payment.Type.ToString(),
            Method = payment.Method.ToString(),
            Description = payment.Description,
            Notes = payment.Notes,
            AppointmentId = payment.AppointmentId,
            ApplicationId = payment.ApplicationId,
            RelatedEntityType = payment.RelatedEntityType,
            RelatedEntityId = payment.RelatedEntityId,
            IyzicoPaymentId = payment.IyzicoPaymentId,
            IyzicoConversationId = payment.IyzicoConversationId,
            IyzicoStatus = payment.IyzicoStatus,
            IyzicoErrorCode = payment.IyzicoErrorCode,
            IyzicoErrorMessage = payment.IyzicoErrorMessage,
            CardLastFourDigits = payment.CardLastFourDigits,
            CardHolderName = payment.CardHolderName,
            CardBrand = payment.CardBrand,
            CardType = payment.CardType,
            InstallmentCount = payment.InstallmentCount,
            IsInstallment = payment.IsInstallment,
            InstallmentNumber = payment.InstallmentNumber,
            InstallmentAmount = payment.InstallmentAmount,
            CreatedAt = payment.CreatedAt,
            PaidAt = payment.PaidAt,
            CancelledAt = payment.CancelledAt,
            RefundedAt = payment.RefundedAt,
            ExpiresAt = payment.ExpiresAt,
            Items = payment.Items.Select(i => new PaymentItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice,
                RelatedEntityType = i.RelatedEntityType,
                RelatedEntityId = i.RelatedEntityId
            }).ToList(),
            Transactions = payment.Transactions.Select(t => new PaymentTransactionDto
            {
                Id = t.Id,
                TransactionId = t.TransactionId,
                Type = t.Type.ToString(),
                Status = t.Status.ToString(),
                Amount = t.Amount,
                Currency = t.Currency,
                ErrorCode = t.ErrorCode,
                ErrorMessage = t.ErrorMessage,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            }).ToList(),
            Refunds = payment.Refunds.Select(r => new PaymentRefundDto
            {
                Id = r.Id,
                RefundNumber = r.RefundNumber,
                Amount = r.Amount,
                Currency = r.Currency,
                Reason = r.Reason,
                Status = r.Status.ToString(),
                IyzicoRefundId = r.IyzicoRefundId,
                CreatedAt = r.CreatedAt,
                CompletedAt = r.CompletedAt,
                RefundedByUserId = r.RefundedByUserId
            }).ToList()
        };
    }
}

/// <summary>
/// Cancel payment request DTO
/// </summary>
public class CancelPaymentRequest
{
    public string? Reason { get; set; }
}

/// <summary>
/// Refund payment request DTO
/// </summary>
public class RefundPaymentRequest
{
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
}

