namespace Wixi.Modules.Core.Application.Subscriptions.Dto;

public record TenantSubscriptionDto(
    Guid Id,
    Guid TenantId,
    string PlanName,
    string PlanCode,
    decimal PriceMonthly,
    decimal PriceYearly,
    string Status,
    DateTime CurrentPeriodStart,
    DateTime CurrentPeriodEnd,
    string BillingInterval,
    string? StripeCustomerId,
    string? StripeSubscriptionId
);
