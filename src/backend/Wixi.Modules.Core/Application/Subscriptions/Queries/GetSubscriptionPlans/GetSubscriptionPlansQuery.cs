using MediatR;
using Wixi.Modules.Core.Application.Subscriptions.Dto;

namespace Wixi.Modules.Core.Application.Subscriptions.Queries.GetSubscriptionPlans;

public record GetSubscriptionPlansQuery : IRequest<List<SubscriptionPlanDto>>;
