using Microsoft.EntityFrameworkCore;
using Iyzipay.Model;
using Iyzipay.Request;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;
using wixi.DataAccess;
using wixi.Payments.Entities;
using wixi.Payments.DTOs;
using wixi.Payments.Interfaces;
using wixi.WebAPI.Configuration;
using wixi.Appointments.Entities;
using wixi.Content.Entities;
using wixi.Email.Interfaces;
using wixi.Email.DTOs;
using wixi.Clients.Entities;
using wixi.Content.Interfaces;

namespace wixi.WebAPI.Services;

public class PaymentService : IPaymentService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<PaymentService> _logger;
    private readonly IyzicoOptions _iyzicoOptions;
    private readonly IEmailSender? _emailSender;
    private readonly IEmailTemplateService? _emailTemplateService;
    private readonly IContentService? _contentService;
    private readonly IConfiguration _configuration;

    public PaymentService(
        WixiDbContext context,
        ILogger<PaymentService> logger,
        IConfiguration configuration,
        IEmailSender? emailSender = null,
        IEmailTemplateService? emailTemplateService = null,
        IContentService? contentService = null)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
        _emailSender = emailSender;
        _emailTemplateService = emailTemplateService;
        _contentService = contentService;
        
        if (_emailSender == null)
        {
            _logger.LogWarning("IEmailSender not injected into PaymentService. Email notifications will be disabled.");
        }
        if (_emailTemplateService == null)
        {
            _logger.LogWarning("IEmailTemplateService not injected into PaymentService. Email notifications will be disabled.");
        }
        
        // Load Iyzico configuration
        _iyzicoOptions = new IyzicoOptions();
        configuration.GetSection("Iyzico").Bind(_iyzicoOptions);
    }

    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto, string? clientIp = null)
    {
        try
        {
            // Generate payment number
            var paymentNumber = GeneratePaymentNumber();
            
            // Iyzico only supports TRY for Turkish cards, convert EUR to TRY if needed
            // Exchange rate: 1 EUR ≈ 35 TRY (approximate, should use real-time rate in production)
            decimal? exchangeRate = null;
            var iyzicoCurrency = "TRY";
            decimal iyzicoAmount;
            
            if (dto.Currency.ToUpper() == "EUR")
            {
                exchangeRate = 35.0m; // Should use real-time exchange rate in production
                iyzicoAmount = dto.Amount * exchangeRate.Value;
            }
            else
            {
                iyzicoAmount = dto.Amount;
            }
            
            // Calculate paid price (with commission - approximately 2.875%)
            var commissionRate = 0.02875m;
            var paidPrice = iyzicoAmount * (1 + commissionRate);
            
            // Create Iyzico payment request
            var request = new CreatePaymentRequest
            {
                Locale = "tr",
                ConversationId = Guid.NewGuid().ToString(),
                Price = iyzicoAmount.ToString("F2"),
                PaidPrice = paidPrice.ToString("F2"),
                Currency = iyzicoCurrency,
                Installment = dto.Installment ?? 1,
                BasketId = $"BASKET-{paymentNumber}",
                PaymentChannel = "WEB",
                PaymentGroup = "PRODUCT",
                CallbackUrl = _iyzicoOptions.CallbackUrl
            };

            // Payment Card
            request.PaymentCard = new PaymentCard
            {
                CardHolderName = dto.CardHolder,
                CardNumber = dto.CardNumber,
                ExpireMonth = dto.ExpireMonth,
                ExpireYear = dto.ExpireYear,
                Cvc = dto.Cvc,
                RegisterCard = 0  // Don't save card
            };

            // Buyer Information
            var nameParts = dto.CustomerName.Split(' ', 2);
            request.Buyer = new Buyer
            {
                Id = $"BUYER-{dto.CustomerEmail}",
                Name = nameParts[0],
                Surname = nameParts.Length > 1 ? nameParts[1] : "",
                Email = dto.CustomerEmail,
                GsmNumber = dto.CustomerPhone,
                IdentityNumber = dto.CustomerIdentityNumber ?? "11111111111", // Iyzico test için geçerli TC kimlik no
                Ip = clientIp ?? "127.0.0.1",
                City = dto.CustomerCity ?? "Istanbul",
                Country = dto.CustomerCountry ?? "Turkey",
                ZipCode = dto.CustomerZipCode ?? "34000",
                RegistrationAddress = dto.CustomerAddress ?? "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
                RegistrationDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                LastLoginDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            // Get appointment or team member info for basket item
            string itemName = "Danışmanlık Hizmeti";
            if (dto.AppointmentId.HasValue)
            {
                var appointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId.Value);
                
                if (appointment != null)
                {
                    // Try to get team member name if available
                    // For now, use appointment title
                    itemName = $"Danışmanlık - {appointment.Title}";
                }
            }
            else if (dto.PaymentType == "CVBuilder")
            {
                itemName = "CV Builder - ATS Uyumlu CV Oluşturma";
            }
            else if (dto.PaymentType == "EquivalencyFee")
            {
                itemName = "Denklik Ücreti - Eğitim Denkliği İşlem Ücreti";
            }

            // Basket Items
            request.BasketItems = new List<BasketItem>
            {
                new BasketItem
                {
                    Id = $"ITEM-{paymentNumber}",
                    Name = itemName,
                    Category1 = "Consultation",
                    Category2 = "Professional Service",
                    ItemType = BasketItemType.VIRTUAL.ToString(),
                    Price = iyzicoAmount.ToString("F2") // Use TRY amount for Iyzico
                }
            };

            // Shipping and Billing Address (same as buyer for consultation)
            var address = new Address
            {
                ContactName = dto.CustomerName,
                City = dto.CustomerCity ?? "Istanbul",
                Country = dto.CustomerCountry ?? "Turkey",
                Description = dto.CustomerAddress ?? "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
                ZipCode = dto.CustomerZipCode ?? "34000"
            };
            request.ShippingAddress = address;
            request.BillingAddress = address;

            // Call Iyzico API with retry mechanism
            var iyzicoOptions = _iyzicoOptions.ToIyzipayOptions();
            object? paymentResponse = null;
            Exception? lastException = null;
            const int maxRetries = 3;
            const int delayMs = 1000; // 1 second delay between retries
            
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    _logger.LogInformation("Attempting Iyzico payment call (Attempt {Attempt}/{MaxRetries})", attempt, maxRetries);
                    paymentResponse = await Iyzipay.Model.Payment.Create(request, iyzicoOptions);
                    lastException = null;
                    break; // Success, exit retry loop
                }
                catch (Exception ex) when (attempt < maxRetries)
                {
                    lastException = ex;
                    _logger.LogWarning(ex, "Iyzico API call failed (Attempt {Attempt}/{MaxRetries}). Retrying in {DelayMs}ms...", 
                        attempt, maxRetries, delayMs);
                    await Task.Delay(delayMs * attempt); // Exponential backoff
                }
            }
            
            // If all retries failed, throw the last exception
            if (paymentResponse == null && lastException != null)
            {
                _logger.LogError(lastException, "Iyzico API call failed after {MaxRetries} attempts", maxRetries);
                throw new Exception($"Iyzico API bağlantı hatası: {lastException.Message}", lastException);
            }
            
            if (paymentResponse == null)
            {
                throw new Exception("Iyzico API yanıt alınamadı");
            }
            
            // Cast to dynamic to access properties
            dynamic paymentResponseDynamic = paymentResponse;

            // Log Iyzico response for debugging
            var responseJson = JsonConvert.SerializeObject(paymentResponse);
            _logger.LogInformation("Iyzico Payment Response: {Response}", responseJson);
            _logger.LogInformation("Iyzico Status: {Status}, PaymentStatus: {PaymentStatus}, ErrorCode: {ErrorCode}, ErrorMessage: {ErrorMessage}",
                (string?)paymentResponseDynamic.Status, (string?)paymentResponseDynamic.PaymentStatus, (string?)paymentResponseDynamic.ErrorCode, (string?)paymentResponseDynamic.ErrorMessage);

            // Extract error information from response
            string? errorCode = paymentResponseDynamic.ErrorCode;
            string? errorMessage = paymentResponseDynamic.ErrorMessage;
            
            // If error info is null, try to extract from raw response
            if (string.IsNullOrEmpty(errorCode) || string.IsNullOrEmpty(errorMessage))
            {
                try
                {
                    dynamic? responseObj = JsonConvert.DeserializeObject(responseJson);
                    if (responseObj != null)
                    {
                        errorCode = errorCode ?? responseObj.errorCode?.ToString();
                        errorMessage = errorMessage ?? responseObj.errorMessage?.ToString();
                        
                        // Try alternative property names
                        if (string.IsNullOrEmpty(errorCode))
                            errorCode = responseObj.ErrorCode?.ToString();
                        if (string.IsNullOrEmpty(errorMessage))
                            errorMessage = responseObj.ErrorMessage?.ToString();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse error from Iyzico response");
                }
            }

            // Create payment entity
            var payment = new wixi.Payments.Entities.Payment
            {
                PaymentNumber = paymentNumber,
                PaymentProvider = "Iyzico",
                ProviderPaymentId = paymentResponseDynamic.PaymentId,
                ConversationId = paymentResponseDynamic.ConversationId,
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                CustomerPhone = dto.CustomerPhone,
                CustomerIdentityNumber = dto.CustomerIdentityNumber,
                Amount = dto.Amount, // Original amount in original currency
                PaidAmount = decimal.Parse(paymentResponseDynamic.PaidPrice ?? "0"), // Paid amount in TRY
                Currency = dto.Currency, // Original currency (EUR)
                ExchangeRate = exchangeRate,
                Type = Enum.Parse<PaymentType>(dto.PaymentType),
                Method = PaymentMethod.CreditCard,
                Description = dto.Description,
                Notes = dto.Notes,
                AppointmentId = dto.AppointmentId,
                ApplicationId = dto.ApplicationId,
                RelatedEntityType = dto.RelatedEntityType,
                RelatedEntityId = dto.RelatedEntityId,
                IyzicoPaymentId = paymentResponseDynamic.PaymentId,
                IyzicoConversationId = paymentResponseDynamic.ConversationId,
                IyzicoStatus = paymentResponseDynamic.PaymentStatus,
                IyzicoErrorCode = errorCode,
                IyzicoErrorMessage = errorMessage,
                IyzicoRawResponse = responseJson,
                InstallmentCount = dto.Installment ?? 1,
                IsInstallment = (dto.Installment ?? 1) > 1
            };

            // Check payment status
            // Iyzico'da başarılı ödeme: Status == "success" VE PaymentStatus != "FAILURE"
            // Ayrıca ErrorCode ve ErrorMessage null veya boş olmalı
            var isSuccess = paymentResponseDynamic.Status?.ToLower() == "success" 
                && paymentResponseDynamic.PaymentStatus?.ToUpper() != "FAILURE"
                && string.IsNullOrEmpty(paymentResponseDynamic.ErrorCode)
                && string.IsNullOrEmpty(paymentResponseDynamic.ErrorMessage);
            
            if (isSuccess)
            {
                payment.Status = PaymentStatus.Completed;
                payment.PaidAt = DateTime.UtcNow;
                payment.CardLastFourDigits = paymentResponseDynamic.LastFourDigits;
                payment.CardBrand = paymentResponseDynamic.CardAssociation;
                payment.CardType = paymentResponseDynamic.CardType;
                
                _logger.LogInformation("Payment successful. PaymentNumber: {PaymentNumber}, IyzicoPaymentId: {IyzicoPaymentId}",
                    paymentNumber, (string?)paymentResponseDynamic.PaymentId);
                
                // Update appointment status if exists
                if (dto.AppointmentId.HasValue)
                {
                    var appointment = await _context.Appointments
                        .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId.Value);
                    
                    if (appointment != null)
                    {
                        appointment.Status = AppointmentStatus.Confirmed;
                        _context.Appointments.Update(appointment);
                    }
                }

                // Create CV Builder session if payment type is CVBuilder
                if (dto.PaymentType == "CVBuilder")
                {
                    var sessionId = Guid.NewGuid();
                    payment.CVBuilderSessionId = sessionId;
                    
                    _logger.LogInformation("CV Builder session created. PaymentId: {PaymentId}, SessionId: {SessionId}", 
                        payment.Id, sessionId);
                }

                // Send email notification for EquivalencyFee payment
                _logger.LogInformation("Checking payment type for email notification. PaymentType: {PaymentType}, PaymentNumber: {PaymentNumber}", 
                    dto.PaymentType, paymentNumber);
                
                if (dto.PaymentType == "EquivalencyFee")
                {
                    _logger.LogInformation("EquivalencyFee payment detected. Attempting to send email notification for payment {PaymentNumber}", paymentNumber);
                    try
                    {
                        await SendEquivalencyFeePaymentCompletedEmailAsync(payment, dto);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error sending equivalency fee payment completed email for payment {PaymentNumber}", paymentNumber);
                        // Don't fail the payment if email fails
                    }
                }
                else
                {
                    _logger.LogInformation("Payment type is {PaymentType}, skipping email notification for payment {PaymentNumber}", 
                        dto.PaymentType, paymentNumber);
                }
            }
            else
            {
                payment.Status = PaymentStatus.Failed;
                
                _logger.LogWarning("Payment failed. PaymentNumber: {PaymentNumber}, Status: {Status}, PaymentStatus: {PaymentStatus}, ErrorCode: {ErrorCode}, ErrorMessage: {ErrorMessage}",
                    paymentNumber, (string?)paymentResponseDynamic.Status, (string?)paymentResponseDynamic.PaymentStatus, errorCode, errorMessage);
                
                // Cancel appointment if exists
                if (dto.AppointmentId.HasValue)
                {
                    var appointment = await _context.Appointments
                        .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId.Value);
                    
                    if (appointment != null)
                    {
                        appointment.Status = AppointmentStatus.Cancelled;
                        _context.Appointments.Update(appointment);
                    }
                }
            }

            // Add payment item
            payment.Items.Add(new wixi.Payments.Entities.PaymentItem
            {
                Name = itemName,
                Description = dto.Description,
                Quantity = 1,
                UnitPrice = dto.Amount,
                TotalPrice = dto.Amount,
                RelatedEntityType = dto.RelatedEntityType,
                RelatedEntityId = dto.RelatedEntityId
            });

            // Add transaction
            payment.Transactions.Add(new PaymentTransaction
            {
                TransactionId = paymentResponseDynamic.PaymentId ?? paymentNumber,
                Type = TransactionType.Payment,
                Status = payment.Status == PaymentStatus.Completed 
                    ? TransactionStatus.Success 
                    : TransactionStatus.Failed,
                Amount = dto.Amount,
                Currency = dto.Currency,
                IyzicoResponse = JsonConvert.SerializeObject(paymentResponse),
                ErrorCode = paymentResponseDynamic.ErrorCode,
                ErrorMessage = paymentResponseDynamic.ErrorMessage,
                CompletedAt = payment.Status == PaymentStatus.Completed ? DateTime.UtcNow : null
            });

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment created. PaymentNumber: {PaymentNumber}, Status: {Status}",
                paymentNumber, payment.Status);

            // If payment failed, throw exception with detailed error message
            if (payment.Status == PaymentStatus.Failed)
            {
                var finalErrorMessage = payment.IyzicoErrorMessage;
                
                // If no error message from Iyzico, create a descriptive one
                if (string.IsNullOrEmpty(finalErrorMessage))
                {
                    if (paymentResponseDynamic.Status?.ToLower() != "success")
                    {
                        finalErrorMessage = $"Iyzico Status: {paymentResponseDynamic.Status}";
                    }
                    else if (paymentResponseDynamic.PaymentStatus?.ToUpper() == "FAILURE")
                    {
                        finalErrorMessage = $"Ödeme durumu: {paymentResponseDynamic.PaymentStatus}";
                    }
                    else
                    {
                        finalErrorMessage = "Ödeme işlemi başarısız oldu";
                    }
                }
                
                var finalErrorCode = payment.IyzicoErrorCode;
                
                // Add error code to message if available
                if (!string.IsNullOrEmpty(finalErrorCode))
                {
                    finalErrorMessage = $"{finalErrorMessage} (Hata Kodu: {finalErrorCode})";
                }
                
                _logger.LogWarning("Payment failed. PaymentNumber: {PaymentNumber}, ErrorCode: {ErrorCode}, Error: {ErrorMessage}",
                    paymentNumber, finalErrorCode, finalErrorMessage);
                throw new Exception(finalErrorMessage);
            }

            return await MapToDtoAsync(payment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment");
            throw;
        }
    }

    public async Task<PaymentDto?> GetPaymentAsync(long paymentId)
    {
        var payment = await _context.Payments
            .Include(p => p.Items)
            .Include(p => p.Transactions)
            .Include(p => p.Appointment)
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment == null)
            return null;

        return await MapToDtoAsync(payment);
    }

    public async Task<PaymentDto?> GetPaymentByNumberAsync(string paymentNumber)
    {
        var payment = await _context.Payments
            .Include(p => p.Items)
            .Include(p => p.Transactions)
            .Include(p => p.Appointment)
            .FirstOrDefaultAsync(p => p.PaymentNumber == paymentNumber);

        if (payment == null)
            return null;

        return await MapToDtoAsync(payment);
    }

    public async Task<PaymentDto?> GetPaymentByIyzicoPaymentIdAsync(string iyzicoPaymentId)
    {
        var payment = await _context.Payments
            .Include(p => p.Items)
            .Include(p => p.Transactions)
            .Include(p => p.Appointment)
            .FirstOrDefaultAsync(p => p.IyzicoPaymentId == iyzicoPaymentId);

        if (payment == null)
            return null;

        return await MapToDtoAsync(payment);
    }

    public async Task<List<PaymentDto>> GetPaymentsByAppointmentIdAsync(long appointmentId)
    {
        var payments = await _context.Payments
            .Include(p => p.Items)
            .Include(p => p.Transactions)
            .Where(p => p.AppointmentId == appointmentId)
            .ToListAsync();

        var result = new List<PaymentDto>();
        foreach (var payment in payments)
        {
            result.Add(await MapToDtoAsync(payment));
        }

        return result;
    }

    public async Task<bool> CancelPaymentAsync(long paymentId, string? reason = null)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment == null)
            throw new Exception("Payment not found");

        if (payment.Status != PaymentStatus.Completed)
            throw new Exception("Only completed payments can be cancelled");

        try
        {
            // Call Iyzico cancel API
            var cancelRequest = new CreateCancelRequest
            {
                Locale = "tr",
                ConversationId = Guid.NewGuid().ToString(),
                PaymentId = payment.IyzicoPaymentId,
                Ip = "127.0.0.1"
            };

            var iyzicoOptions = _iyzicoOptions.ToIyzipayOptions();
            var cancelResponse = await Iyzipay.Model.Cancel.Create(cancelRequest, iyzicoOptions);

            if (cancelResponse.Status == "success")
            {
                payment.Status = PaymentStatus.Cancelled;
                payment.CancelledAt = DateTime.UtcNow;
                payment.Notes = reason;
                payment.IyzicoRawResponse = JsonConvert.SerializeObject(cancelResponse);

                // Add transaction
                payment.Transactions.Add(new PaymentTransaction
                {
                    TransactionId = cancelResponse.PaymentId ?? payment.PaymentNumber,
                    Type = TransactionType.Cancel,
                    Status = TransactionStatus.Success,
                    Amount = payment.Amount,
                    Currency = payment.Currency,
                    IyzicoResponse = JsonConvert.SerializeObject(cancelResponse),
                    CompletedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                _logger.LogWarning("Failed to cancel payment. PaymentId: {PaymentId}, Error: {Error}",
                    paymentId, cancelResponse.ErrorMessage);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling payment {PaymentId}", paymentId);
            throw;
        }
    }

    public async Task<bool> RefundPaymentAsync(long paymentId, decimal amount, string? reason = null)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment == null)
            throw new Exception("Payment not found");

        if (payment.Status != PaymentStatus.Completed)
            throw new Exception("Only completed payments can be refunded");

        if (amount > payment.PaidAmount)
            throw new Exception("Refund amount cannot exceed paid amount");

        try
        {
            // Call Iyzico refund API
            var refundRequest = new CreateRefundRequest
            {
                Locale = "tr",
                ConversationId = Guid.NewGuid().ToString(),
                PaymentTransactionId = payment.IyzicoPaymentId,
                Price = amount.ToString("F2"),
                Currency = payment.Currency,
                Ip = "127.0.0.1"
            };

            var iyzicoOptions = _iyzicoOptions.ToIyzipayOptions();
            var refundResponse = await Iyzipay.Model.Refund.Create(refundRequest, iyzicoOptions);

            if (refundResponse.Status == "success")
            {
                var refundNumber = GenerateRefundNumber();
                
                var refund = new PaymentRefund
                {
                    PaymentId = payment.Id,
                    RefundNumber = refundNumber,
                    Amount = amount,
                    Currency = payment.Currency,
                    Reason = reason,
                    Status = RefundStatus.Completed,
                    IyzicoRefundId = refundResponse.PaymentId,
                    IyzicoResponse = JsonConvert.SerializeObject(refundResponse),
                    CompletedAt = DateTime.UtcNow
                };

                payment.Refunds.Add(refund);
                
                // Update payment status if full refund
                if (amount >= payment.PaidAmount)
                {
                    payment.Status = PaymentStatus.Refunded;
                    payment.RefundedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                _logger.LogWarning("Failed to refund payment. PaymentId: {PaymentId}, Error: {Error}",
                    paymentId, refundResponse.ErrorMessage);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding payment {PaymentId}", paymentId);
            throw;
        }
    }

    public async Task ProcessWebhookAsync(WebhookPayload payload)
    {
        try
        {
            // Verify webhook signature
            if (!VerifyWebhookSignature(payload))
            {
                _logger.LogWarning("Invalid webhook signature");
                return;
            }

            // Find payment
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.IyzicoPaymentId == payload.IyziPaymentId ||
                                         p.IyzicoPaymentId == payload.PaymentId);

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for webhook. PaymentId: {PaymentId}",
                    payload.IyziPaymentId ?? payload.PaymentId);
                return;
            }

            // Process webhook based on event type
            switch (payload.IyziEventType)
            {
                case "PAYMENT_SUCCESS":
                    if (payment.Status == PaymentStatus.Pending)
                    {
                        payment.Status = PaymentStatus.Completed;
                        payment.PaidAt = DateTime.UtcNow;
                        payment.IyzicoStatus = payload.Status;
                        await _context.SaveChangesAsync();
                    }
                    break;

                case "PAYMENT_FAILURE":
                    if (payment.Status == PaymentStatus.Pending)
                    {
                        payment.Status = PaymentStatus.Failed;
                        payment.IyzicoStatus = payload.Status;
                        await _context.SaveChangesAsync();
                    }
                    break;

                case "REFUND_SUCCESS":
                    // Handle refund webhook
                    break;

                case "CANCEL_SUCCESS":
                    if (payment.Status == PaymentStatus.Completed)
                    {
                        payment.Status = PaymentStatus.Cancelled;
                        payment.CancelledAt = DateTime.UtcNow;
                        payment.IyzicoStatus = payload.Status;
                        await _context.SaveChangesAsync();
                    }
                    break;
            }

            _logger.LogInformation("Webhook processed. EventType: {EventType}, PaymentId: {PaymentId}",
                payload.IyziEventType, payment.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            throw;
        }
    }

    private bool VerifyWebhookSignature(WebhookPayload payload)
    {
        try
        {
            var secretKey = _iyzicoOptions.SecretKey;
            var key = secretKey + payload.IyziEventType + (payload.IyziPaymentId ?? payload.PaymentId) +
                     (payload.Token ?? "") + payload.PaymentConversationId + payload.Status;

            using var hmac = new System.Security.Cryptography.HMACSHA256(
                System.Text.Encoding.UTF8.GetBytes(secretKey));
            var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(key));
            var signature = BitConverter.ToString(hash).Replace("-", "").ToLower();

            return signature == payload.Signature?.ToLower();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying webhook signature");
            return false;
        }
    }

    private string GeneratePaymentNumber()
    {
        return $"PAY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }

    private string GenerateRefundNumber()
    {
        return $"REF-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }

    private Task<PaymentDto> MapToDtoAsync(wixi.Payments.Entities.Payment payment)
    {
        return Task.FromResult(new PaymentDto
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
            }).ToList()
        });
    }

    private async Task SendEquivalencyFeePaymentCompletedEmailAsync(wixi.Payments.Entities.Payment payment, CreatePaymentDto dto)
    {
        if (_emailSender == null || _emailTemplateService == null)
        {
            _logger.LogWarning("Email services not available, skipping email for payment {PaymentNumber}. EmailSender: {EmailSender}, EmailTemplateService: {EmailTemplateService}", 
                payment.PaymentNumber, _emailSender == null ? "NULL" : "OK", _emailTemplateService == null ? "NULL" : "OK");
            return;
        }

        try
        {
            _logger.LogInformation("Attempting to send equivalency fee payment completed email for payment {PaymentNumber} to {Email}", 
                payment.PaymentNumber, dto.CustomerEmail);

            // Get client by email
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Email == dto.CustomerEmail);

            if (client == null)
            {
                var emailPrefix = dto.CustomerEmail.Split('@')[0];
                var similarCount = await _context.Clients.CountAsync(c => c.Email.Contains(emailPrefix));
                _logger.LogWarning("Client not found for email {Email}, skipping payment email. Available clients with similar emails: {Count}", 
                    dto.CustomerEmail, similarCount);
                return;
            }

            _logger.LogInformation("Client found: {ClientId} - {FullName}", client.Id, $"{client.FirstName} {client.LastName}");

            // Get email template
            var templateDto = await _emailTemplateService.GetByKeyAsync("EquivalencyFeePaymentCompleted");

            if (templateDto == null)
            {
                _logger.LogError("Email template 'EquivalencyFeePaymentCompleted' not found in database. Please run the SQL script: AddEquivalencyFeePaymentCompletedEmailTemplate.sql");
                return;
            }

            if (!templateDto.IsActive)
            {
                _logger.LogWarning("Email template 'EquivalencyFeePaymentCompleted' exists but is inactive. Template ID: {TemplateId}", templateDto.Id);
                return;
            }

            _logger.LogInformation("Email template found and active. Template ID: {TemplateId}", templateDto.Id);

            // Determine language (default to TR if not available)
            var emailLanguage = "tr"; // TODO: Get from client preferences

            string emailSubject = emailLanguage switch
            {
                "tr" => templateDto.Subject_TR ?? templateDto.Subject_EN ?? "Denklik Ücreti Ödemesi Tamamlandı",
                "en" => templateDto.Subject_EN ?? templateDto.Subject_TR ?? "Equivalency Fee Payment Completed",
                "de" => templateDto.Subject_DE ?? templateDto.Subject_EN ?? "Gleichwertigkeitsgebühr Zahlung Abgeschlossen",
                "ar" => templateDto.Subject_AR ?? templateDto.Subject_EN ?? "اكتمال دفع رسوم المعادلة",
                _ => templateDto.Subject_TR ?? "Denklik Ücreti Ödemesi Tamamlandı"
            };

            string emailBody = emailLanguage switch
            {
                "tr" => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? "",
                "en" => templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                "de" => templateDto.BodyHtml_DE ?? templateDto.BodyHtml_EN ?? "",
                "ar" => templateDto.BodyHtml_AR ?? templateDto.BodyHtml_EN ?? "",
                _ => templateDto.BodyHtml_TR ?? ""
            };

            // Replace placeholders
            var clientFullName = $"{client.FirstName} {client.LastName}";
            var paymentDate = payment.PaidAt?.ToString("dd/MM/yyyy HH:mm") ?? DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm");
            
            // Get PortalLink and SupportEmail from SystemSettings
            var systemSettings = await _contentService?.GetSystemSettingsAsync()!;
            var portalUrl = systemSettings?.PortalUrl ?? _configuration["Portal:BaseUrl"] ?? "https://portal.worklines.de";
            var portalLink = $"{portalUrl}/client/dashboard";
            var supportEmail = systemSettings?.SupportEmail ?? _configuration["Support:Email"] ?? "support@worklines.de";
            
            _logger.LogInformation("Using PortalLink: {PortalLink}, SupportEmail: {SupportEmail} from SystemSettings", portalLink, supportEmail);

            emailBody = emailBody
                .Replace("{{FullName}}", clientFullName)
                .Replace("{{ClientName}}", clientFullName)
                .Replace("{{FirstName}}", client.FirstName)
                .Replace("{{LastName}}", client.LastName)
                .Replace("{{PaymentAmount}}", payment.Amount.ToString("F2"))
                .Replace("{{PaymentCurrency}}", payment.Currency)
                .Replace("{{PaymentNumber}}", payment.PaymentNumber)
                .Replace("{{PaymentDate}}", paymentDate)
                .Replace("{{PortalLink}}", portalLink)
                .Replace("{{SupportEmail}}", supportEmail);

            emailSubject = emailSubject
                .Replace("{{PaymentNumber}}", payment.PaymentNumber);

            var emailMessage = new EmailMessage
            {
                To = new List<string> { dto.CustomerEmail },
                Subject = emailSubject,
                BodyHtml = emailBody,
                TemplateKey = "EquivalencyFeePaymentCompleted",
                CorrelationId = Guid.NewGuid().ToString(),
                Metadata = new Dictionary<string, string>
                {
                    { "Type", "EquivalencyFeePaymentCompleted" },
                    { "PaymentId", payment.Id.ToString() },
                    { "PaymentNumber", payment.PaymentNumber },
                    { "ClientId", client.Id.ToString() },
                    { "Amount", payment.Amount.ToString() },
                    { "Currency", payment.Currency }
                }
            };

            await _emailSender.SendAsync(emailMessage);

            _logger.LogInformation("Equivalency fee payment completed email sent to client {ClientId} ({Email}) for payment {PaymentNumber}",
                client.Id, dto.CustomerEmail, payment.PaymentNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending equivalency fee payment completed email for payment {PaymentNumber}", payment.PaymentNumber);
            // Don't fail the payment if email fails
        }
    }
}

