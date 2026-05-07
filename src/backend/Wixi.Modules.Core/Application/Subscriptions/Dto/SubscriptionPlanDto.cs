namespace Wixi.Modules.Core.Application.Subscriptions.Dto;

public record SubscriptionPlanDto(
    Guid Id,
    string Name,
    string Code,
    decimal PriceMonthly,
    decimal PriceYearly,
    string FeaturesJson,
    int MaxProducts,
    int MaxUsers,
    int SortOrder
);
